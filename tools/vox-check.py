"""조연 목소리 검사 — 받아쓰기(Whisper)로 대본과 맞춰 보고, 음높이 중앙값을 잰다. tools/voices-vox.js 가 부른다.

  <venv python> tools/vox-check.py checks.json
checks.json: [{ "key", "wav", "text" }] → 줄마다 {"key", "heard", "sim": 0~1, "pmin" · "pmean": 낱말 확신도, "hz", "secs", "gap": 가장 긴 침묵(초)}
"""
import difflib
import json
import re
import sys

import numpy as np
import soundfile as sf
import whisper

norm = lambda s: re.sub(r"[^0-9A-Za-z가-힣]", "", s)


def pitch(x, sr):
    # 자기상관으로 잰 음높이 중앙값 (소리가 큰 구간만)
    W, H = int(sr * 0.04), int(sr * 0.01)
    lo, hi = int(sr / 400), int(sr / 65)
    en = np.array([np.sqrt(np.mean(x[s:s + W] ** 2)) for s in range(0, len(x) - W - hi, H)])
    if not len(en):
        return 0
    gate, f0 = en.max() * 0.1, []
    for k, s in enumerate(range(0, len(x) - W - hi, H)):
        if en[k] < gate:
            continue
        a = x[s:s + W + hi]
        seg = a[:W]
        r = np.array([np.dot(seg, a[l:l + W]) / (np.sqrt(np.dot(seg, seg) * np.dot(a[l:l + W], a[l:l + W])) + 1e-9) for l in range(lo, hi)])
        if r.max() > 0.6:
            f0.append(sr / (lo + r.argmax()))
    return float(np.median(f0)) if f0 else 0


def longest_gap(x, sr):
    W = int(sr * 0.02)
    en = np.array([np.sqrt(np.mean(x[s:s + W] ** 2)) for s in range(0, len(x) - W, W)])
    if not len(en):
        return 0
    quiet = en < en.max() * 0.02
    best = run = 0
    started = False
    for q in quiet:
        if not q:
            started = True
        run = run + 1 if (q and started) else 0
        best = max(best, run)
    return best * 0.02


def main():
    items = json.load(open(sys.argv[1], encoding="utf-8"))
    model = whisper.load_model(sys.argv[2] if len(sys.argv) > 2 else "turbo")
    for it in items:
        x, sr = sf.read(it["wav"], dtype="float32")
        if x.ndim > 1:
            x = x.mean(axis=1)
        res = model.transcribe(it["wav"], language="ko", fp16=True, word_timestamps=True, condition_on_previous_text=False)
        heard = res["text"].strip()
        sim = difflib.SequenceMatcher(None, norm(it["text"]), norm(heard)).ratio()
        # 낱말마다 받아쓰기가 얼마나 확신했는지: 뭉개지거나 삼킨 낱말은 낮게 나온다
        probs = [w["probability"] for s in res["segments"] for w in s.get("words", [])]
        x16 = x[:: max(1, sr // 16000)]
        print(json.dumps({"key": it["key"], "heard": heard, "sim": round(sim, 3), "pmin": round(min(probs), 3) if probs else None, "pmean": round(sum(probs) / len(probs), 3) if probs else None,
                          "hz": round(pitch(x16, 16000)), "secs": round(len(x) / sr, 2), "gap": round(longest_gap(x, sr), 2)}, ensure_ascii=False), flush=True)


if __name__ == "__main__":
    main()
