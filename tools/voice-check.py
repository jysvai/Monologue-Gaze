#!/usr/bin/env python
"""목소리 점검 — 대사 중간에 목소리가 툭 떨어지는 곳(낮은 음역으로 내려앉아 긁히는 소리) 찾기.
v4 계열 모델은 안정도가 낮고 감정 지시([shaky] [nervous] …)가 붙으면 문장 한가운데서 7~17반음 내려앉는 일이 있다.
두 가지 방법(YIN · 켑스트럼)으로 음높이를 재어, 둘 다 「0.3초 구간이 앞뒤 1초보다 7반음 넘게 낮다」고 할 때만 잡는다. 말끝 0.5초는 뺀다.

사용: python tools/voice-check.py audio/voice/c07/p_mansik-k_wife.mp3 [...]   (잡히면 종료 코드 1, 한 줄에 하나씩 JSON)
      python tools/voice-check.py --all                                        (audio/voice 전부, 잡힌 것만)
(numpy · ffmpeg 필요)
"""
import sys, os, json, glob, subprocess
import numpy as np

SR = 16000
ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')


def pcm(f):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ac', '1', '-ar', str(SR), '-f', 's16le', '-'], capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.int16).astype(np.float32) / 32768


def yin(x, W=800, H=160, fmin=65, fmax=420, th=0.15):
    n = max(0, (len(x) - 2 * W) // H)
    if n < 5:
        return np.zeros(0)
    tmax = SR // fmin
    fr = x[np.arange(W + tmax)[None, :] + H * np.arange(n)[:, None]]
    a = fr[:, :W]
    en = np.sqrt((a ** 2).mean(axis=1))
    L = 1 << int(np.ceil(np.log2(2 * (W + tmax))))
    r = np.fft.irfft(np.conj(np.fft.rfft(a, L, axis=1)) * np.fft.rfft(fr, L, axis=1), L, axis=1)[:, :tmax]
    cs = np.cumsum(np.concatenate([np.zeros((n, 1)), fr ** 2], axis=1), axis=1)
    t = np.arange(tmax)
    d = (cs[:, W] - cs[:, 0])[:, None] + (cs[:, t + W] - cs[:, t]) - 2 * r
    d[:, 0] = 0
    cm = np.concatenate([np.ones((n, 1)), d[:, 1:] * np.arange(1, tmax)[None, :] / (np.cumsum(d[:, 1:], axis=1) + 1e-12)], axis=1)
    tmin, gate, f0 = SR // fmax, np.percentile(en, 95) * 0.15, np.zeros(n)
    for i in range(n):
        if en[i] < gate:
            continue
        c = cm[i, tmin:]
        below = np.nonzero(c < th)[0]
        if not len(below):
            continue
        j = below[0]
        while j + 1 < len(c) and c[j + 1] < c[j]:
            j += 1
        f0[i] = SR / (j + tmin)
    return f0


def ceps(x, W=1024, H=160, fmin=60, fmax=420):
    n = max(0, (len(x) - W) // H)
    if n < 5:
        return np.zeros(0)
    fr = x[np.arange(W)[None, :] + H * np.arange(n)[:, None]] * np.hanning(W)[None, :]
    en = np.sqrt((fr ** 2).mean(axis=1))
    q = np.fft.irfft(np.log(np.abs(np.fft.rfft(fr, axis=1)) + 1e-6), axis=1)[:, SR // fmax:SR // fmin]
    return np.where((en > np.percentile(en, 95) * 0.15) & (q.max(axis=1) > 0.08), SR / (q.argmax(axis=1) + SR // fmax), 0.0)


def semis(f):
    return np.where(f > 0, 12 * np.log2(np.maximum(f, 1) / 100), np.nan)


def dips(s, i, span=30):
    mid = s[i:i + span]
    ctx = np.concatenate([s[max(0, i - 80):i - 10], s[i + 40:i + 110]])
    if np.sum(~np.isnan(mid)) < 8 or np.sum(~np.isnan(ctx)) < 20:
        return None
    return float(np.nanmedian(mid) - np.nanmedian(ctx))


def pauses(x, H=160, W=400):
    # 0.01초마다 소리가 있는지 (말 사이 쉼을 찾는다)
    n = max(0, (len(x) - W) // H)
    en = np.array([np.sqrt(np.mean(x[i * H:i * H + W] ** 2)) for i in range(n)])
    return en < np.percentile(en, 90) * 0.06 if n else np.zeros(0, bool)


def check(f, need=-7.0):
    x = pcm(f)
    dur = len(x) / SR
    a, b = semis(yin(x)), semis(ceps(x))
    quiet = pauses(x)
    n = min(len(a), len(b))
    found = []
    for i in range(30, n - 30, 5):
        if (i + 30) * 0.01 > dur - 0.5:
            break
        # 문장 끝(내려앉은 뒤 0.15초 넘게 쉼)은 자연스러운 억양이라 뺀다 — 말을 이어 가는 도중에 내려앉는 것만
        after = quiet[i + 20:i + 60]
        if len(after) and max((len(r) for r in ''.join('1' if q else '0' for q in after).split('0')), default=0) >= 15:
            continue
        da = dips(a, i)
        if da is None or da > -9:
            continue
        db = dips(b, i)
        if db is not None and db < need:
            found.append((round(i * 0.01, 2), round(da, 1), round(db, 1)))
    worst = min([min(d[1], d[2]) for d in found], default=0.0)
    return {'file': os.path.relpath(f, ROOT).replace('\\', '/'), 'dur': round(dur, 2), 'drops': found[:6], 'worst': round(worst, 1)}


if __name__ == '__main__':
    args = sys.argv[1:]
    files = sorted(glob.glob(os.path.join(ROOT, 'audio', 'voice', '**', '*.mp3'), recursive=True)) if args == ['--all'] else args
    bad = 0
    for f in files:
        r = check(f)
        if r['drops'] or args != ['--all']:
            print(json.dumps(r, ensure_ascii=False))
        bad += bool(r['drops'])
    if args == ['--all']:
        print(f'{bad} / {len(files)} files with a mid-line drop', file=sys.stderr)
    sys.exit(1 if bad else 0)
