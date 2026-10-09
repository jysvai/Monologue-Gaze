#!/usr/bin/env python
"""살아 있는 초상 만들기 — 탐문에서 눈을 깜빡이고 말할 때 입이 움직이는 얼굴 한 장(img/<사건>/face_<사람 id>.webp).
엔진(js/engine.js faceOf)은 그 파일이 있으면 이니셜 대신 얼굴을 보인다. 칸: 가로 3칸(그대로 · 눈 감음 · 입 벌림) × 줄(평소 · 흔들림 · 무너짐), 칸은 4:5.
흔들림은 추궁이 통한 뒤, 무너짐은 사건을 닫은 뒤의 범인 — 줄이 하나뿐이면 늘 평소 얼굴이다.

만드는 순서 (원본은 img/_src/<사건>/face/<사람 id>/ 에 둔다 — git·zip 밖):
  1. 기본 초상 calm.png (정사각, 눈 뜨고 입 다문 얼굴, 단색 바탕) 을 그린다.
  2. 그림 편집 도구(agy 의 image-generator, Codex 그림 도구)로 calm.png 를 고쳐 눈 감은 판 · 입 벌린 판을 받는다.
  3. merge 로 고친 곳만 골라 붙인다 → blink.png · talk.png. 나머지 픽셀이 calm 그대로라 칸을 바꿔도 흔들리지 않는다.
  4. (범인 등) 표정 줄: 흔들린 얼굴 · 무너진 얼굴을 편집으로 받아 whole 로 자리를 맞춘다 → shaken.png · broken.png,
     그 그림을 다시 고쳐 shaken_blink/shaken_talk · broken_blink/broken_talk 를 merge 한다.
  5. sheet 로 한 장에 붙여 img/<사건>/face_<사람 id>.webp 로 두고 node tools/manifest.js.

사용: python tools/face.py merge <부모.png> <편집본.png> <out.png>
      python tools/face.py whole <calm.png> <표정 편집본.png> <out.png>
      python tools/face.py sheet <폴더> <out.webp> [calm,shaken,broken]
(opencv-python · numpy · Pillow 필요)
"""
import sys, os, json, cv2, numpy as np
from PIL import Image

LANCZOS = Image.Resampling.LANCZOS
FW, FH = 336, 420  # 칸 하나 (4:5)


def load(p, size=None):
    im = Image.open(p).convert('RGB')
    if size and im.size != size:
        im = im.resize(size, LANCZOS)
    return np.array(im).astype(np.float32)


def align(B, V):
    g1 = cv2.cvtColor(B.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    g2 = cv2.cvtColor(V.astype(np.uint8), cv2.COLOR_RGB2GRAY).astype(np.float32) / 255
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(g1, g2, warp, cv2.MOTION_AFFINE, (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), np.ones_like(g1, dtype=np.uint8), 5)
    except cv2.error:
        pass
    return cv2.warpAffine(V, warp, (B.shape[1], B.shape[0]), flags=cv2.INTER_LINEAR + cv2.WARP_INVERSE_MAP, borderMode=cv2.BORDER_REPLICATE), warp


def change_mask(B, A, thr=11.0):
    d = np.abs(B - A).mean(axis=2)
    m = cv2.GaussianBlur(d, (0, 0), 4)
    core = (m > thr).astype(np.uint8)
    n, lab, stats, _ = cv2.connectedComponentsWithStats(core, connectivity=8)
    keep = np.zeros_like(core)
    # 다시 그리며 생긴 잔무늬(머리카락 결 등)는 봉우리가 낮다(~30). 실제로 고친 곳(눈 감기·입 벌리기)은 100 남짓 — 봉우리가 높은 덩어리만
    peak_min = max(40.0, 0.3 * float(m.max()))
    for i in range(1, n):
        if float(m[lab == i].max()) >= peak_min:
            keep[lab == i] = 1
    keep = cv2.dilate(keep, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    soft = np.clip(cv2.GaussianBlur(keep.astype(np.float32), (0, 0), 9) * 1.7, 0, 1)
    return soft, keep


def merge(parent, edit, out):
    B = load(parent)
    V = load(edit, (B.shape[1], B.shape[0]))
    A, warp = align(B, V)
    if np.abs(B - V).mean() <= np.abs(B - A).mean():  # 이미 픽셀이 맞으면 옮기지 않는다 (옮기면 오히려 흐려진다)
        A, warp = V, np.eye(2, 3, dtype=np.float32)
    m, keep = change_mask(B, A)
    O = B * (1 - m[..., None]) + A * m[..., None]
    Image.fromarray(np.clip(O, 0, 255).astype(np.uint8)).save(out)
    ys, xs = np.nonzero(keep)
    box = [int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())] if len(xs) else None
    info = {'out': out, 'area': round(float(keep.mean()), 4), 'box': box, 'shift': [round(float(warp[0, 2]), 2), round(float(warp[1, 2]), 2)],
            'centroid': [int(xs.mean()), int(ys.mean())] if len(xs) else None}
    print(json.dumps(info))
    return info


def crop_box(size, eye):
    W, H = size
    ch = int(H * 0.86)
    cw = int(ch * 4 / 5)
    x0 = int(np.clip(eye[0] - cw / 2, 0, W - cw))
    y0 = int(np.clip(eye[1] - ch * 0.40, 0, H - ch))
    return (x0, y0, x0 + cw, y0 + ch)


def sheet(d, out, rows=None):
    names = ['calm', 'shaken', 'broken']
    rows = rows or [r for r in names if os.path.exists(os.path.join(d, r + '.png'))]
    base = load(os.path.join(d, 'calm.png'))
    blink = load(os.path.join(d, 'blink.png'), (base.shape[1], base.shape[0]))
    _, keep = change_mask(base, blink)
    ys, xs = np.nonzero(keep)
    eye = (xs.mean(), ys.mean())
    box = crop_box((base.shape[1], base.shape[0]), eye)
    S = Image.new('RGB', (FW * 3, FH * len(rows)))
    for r, row in enumerate(rows):
        pre = '' if row == 'calm' else row + '_'
        for c, kind in enumerate(['', 'blink', 'talk']):
            f = os.path.join(d, (row if kind == '' else pre + kind) + '.png')
            if not os.path.exists(f):
                f = os.path.join(d, row + '.png')  # 없는 칸은 그 줄의 기본 얼굴로
            im = Image.open(f).convert('RGB').resize(Image.open(os.path.join(d, 'calm.png')).size, LANCZOS).crop(box).resize((FW, FH), LANCZOS)
            S.paste(im, (c * FW, r * FH))
    S.save(out, 'WEBP', quality=80, method=6)
    print(json.dumps({'out': out, 'rows': rows, 'crop': box, 'eye': [int(eye[0]), int(eye[1])], 'bytes': os.path.getsize(out)}))


def whole(parent, edit, out):
    # 표정 줄: 편집본 전체를 쓰되 기본 그림 자리에 맞춰 옮긴다 (줄이 바뀌는 순간은 일부러 달라지는 때라 전체를 써도 된다)
    B = load(parent)
    V = load(edit, (B.shape[1], B.shape[0]))
    A, warp = align(B, V)
    Image.fromarray(np.clip(A, 0, 255).astype(np.uint8)).save(out)
    print(json.dumps({'out': out, 'shift': [round(float(warp[0, 2]), 2), round(float(warp[1, 2]), 2)]}))


if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'merge':
        merge(*sys.argv[2:5])
    elif cmd == 'whole':
        whole(*sys.argv[2:5])
    elif cmd == 'sheet':
        sheet(sys.argv[2], sys.argv[3], sys.argv[4].split(',') if len(sys.argv) > 4 else None)
