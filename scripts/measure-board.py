#!/usr/bin/env python3
"""Measure the ink boxes of every text block on the approved board.

The board (docs/modelo-2-aprovado.png, 760 px wide) is the desktop acceptance
test. Each block is searched inside a hand-set window; ink = cream pixels
(on photos) or espresso pixels (on the blush section). Results go to
src/board.json in board px and are drawn over the board in qa/board-ink.png.

Usage: npm run measure
"""
from pathlib import Path
import json
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
board = cv2.imread(str(ROOT / "docs/modelo-2-aprovado.png"))[:, :, :3]
f = cv2.cvtColor(board, cv2.COLOR_BGR2LAB).astype(np.float32)
L, A, B = f[:, :, 0] * 100 / 255, f[:, :, 1] - 128, f[:, :, 2] - 128
chroma = np.hypot(A, B)
cream = (L > 84) & (chroma < 14)
espresso = (L < 36) & (B > 6)

# name: (x0, y0, x1, y1, ink, row-split threshold)
BLOCKS = {
    "nav": (230, 25, 500, 50, "cream"),
    "cta": (585, 20, 715, 57, "cream"),
    "wordmark": (50, 108, 205, 135, "cream"),
    "hero-l1": (160, 180, 600, 268, "cream"),
    "hero-l2": (190, 270, 545, 350, "cream"),
    "hero-note": (52, 355, 200, 420, "cream"),
    "detail-num": (50, 530, 90, 555, "cream"),
    "detail-h": (50, 605, 365, 720, "cream"),
    "detail-sub": (52, 735, 280, 800, "cream"),
    "work-num": (50, 893, 90, 912, "cream"),
    "work-h": (50, 955, 190, 1015, "cream"),
    "dein": (40, 1040, 740, 1300, "cream"),
    "services-num": (265, 1352, 300, 1372, "espresso"),
    "services-h": (265, 1405, 640, 1495, "espresso"),
    "services-list": (265, 1515, 735, 1550, "espresso"),
    "studio-num": (50, 1675, 90, 1695, "cream"),
    "studio-h": (485, 1785, 730, 1865, "cream"),
    "studio-place": (485, 1870, 590, 1895, "cream"),
}


def rows(mask, min_gap=3):
    """Split a block into text lines by empty rows."""
    on = mask.any(axis=1)
    out, start, gap = [], None, 0
    for i, v in enumerate(on):
        if v:
            if start is None:
                start = i
            gap = 0
        elif start is not None:
            gap += 1
            if gap >= min_gap:
                out.append((start, i - gap + 1))
                start, gap = None, 0
    if start is not None:
        out.append((start, len(on)))
    return out


result = {"board": {"width": board.shape[1], "height": board.shape[0]}, "blocks": {}}
vis = board.copy()
for name, (x0, y0, x1, y1, ink) in BLOCKS.items():
    m = (cream if ink == "cream" else espresso)[y0:y1, x0:x1].astype(np.uint8)
    m = cv2.morphologyEx(m, cv2.MORPH_OPEN, np.ones((2, 1), np.uint8))
    ys, xs = np.nonzero(m)
    if len(xs) == 0:
        print(f"{name}: no ink")
        continue
    lines = []
    for a, b in rows(m):
        sub = m[a:b]
        cx = np.nonzero(sub.any(axis=0))[0]
        lines.append({"x": int(x0 + cx[0]), "y": int(y0 + a), "w": int(cx[-1] - cx[0] + 1), "h": int(b - a)})
    box = {"x": int(x0 + xs.min()), "y": int(y0 + ys.min()), "w": int(xs.max() - xs.min() + 1),
           "h": int(ys.max() - ys.min() + 1), "lines": lines}
    result["blocks"][name] = box
    cv2.rectangle(vis, (box["x"], box["y"]), (box["x"] + box["w"], box["y"] + box["h"]), (0, 255, 255), 1)
    for ln in lines:
        cv2.rectangle(vis, (ln["x"], ln["y"]), (ln["x"] + ln["w"], ln["y"] + ln["h"]), (255, 0, 255), 1)
    print(f"{name:14s} x={box['x']:4d} y={box['y']:5d} w={box['w']:4d} h={box['h']:4d} lines={[(l['x'], l['y'], l['w'], l['h']) for l in lines]}")

(ROOT / "qa").mkdir(exist_ok=True)
cv2.imwrite(str(ROOT / "qa/board-ink.png"), cv2.resize(vis, None, fx=2, fy=2, interpolation=cv2.INTER_NEAREST))
(ROOT / "src").mkdir(exist_ok=True)
(ROOT / "src/board.json").write_text(json.dumps(result, indent=1))
