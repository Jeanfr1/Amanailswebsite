#!/usr/bin/env python3
"""Cut the foreground layers (finger + brush, hands) and the logo symbol.

The page puts live type *behind* fingers, as on the approved board. Each
cut-out is a full-frame RGBA copy of its photo, so it registers pixel for
pixel with the base image under the same object-fit and transform.
The source photos are never modified.

Usage: npm run prepare-images   (writes assets-src/, overlays in qa/masks/)
"""
from pathlib import Path
import cv2
import numpy as np

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets-src"
QA = ROOT / "qa" / "masks"
SRC.mkdir(exist_ok=True)
QA.mkdir(parents=True, exist_ok=True)


def disk(r):
    return cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (r, r))


def lab(img):
    f = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    return f[:, :, 0] * 100 / 255, f[:, :, 1] - 128, f[:, :, 2] - 128


def poly(shape, pts):
    m = np.zeros(shape, np.uint8)
    cv2.fillPoly(m, [np.array(pts, np.int32)], 255)
    return m > 0


def grabcut(img, mask, iters=6):
    bgd = np.zeros((1, 65), np.float64)
    fgd = np.zeros((1, 65), np.float64)
    cv2.grabCut(img, mask, None, bgd, fgd, iters, cv2.GC_INIT_WITH_MASK)
    return np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 255, 0).astype(np.uint8)


def clean(m, min_area, hole_area):
    n, lbl, st, _ = cv2.connectedComponentsWithStats(m)
    out = np.zeros_like(m)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] >= min_area:
            out[lbl == i] = 255
    inv = 255 - out
    n, lbl, st, _ = cv2.connectedComponentsWithStats(inv)
    for i in range(1, n):
        if st[i, cv2.CC_STAT_AREA] < hole_area:
            out[lbl == i] = 255
    return out


def feather(m, r=1.2):
    """Soft 1-2 px edge so the cut-out sits on the base without a halo."""
    eroded = cv2.erode(m, disk(3))
    return cv2.GaussianBlur(eroded, (0, 0), r)


def save_cutout(img, alpha, name):
    rgba = np.dstack([img, alpha])
    cv2.imwrite(str(SRC / f"{name}.png"), rgba)
    ov = (img.astype(np.float32) * 0.28).astype(np.uint8)
    keep = alpha > 127
    ov[keep] = img[keep]
    cnts, _ = cv2.findContours((alpha > 127).astype(np.uint8), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
    cv2.drawContours(ov, cnts, -1, (0, 255, 255), 1)
    cv2.imwrite(str(QA / f"{name}-overlay.jpg"), ov, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(f"{name}: {keep.mean() * 100:.1f}% foreground")


def hero(path, name, finger_zone, brush_axis, brush_width):
    """Finger + nail by luminance/warmth inside the finger zone, brush as a tapered polygon."""
    img = cv2.imread(str(path))[:, :, :3]
    h, w = img.shape[:2]
    L, a, b = lab(img)
    zone = poly((h, w), finger_zone)
    bright = (L > 30) & (b > 12) & zone
    mask = np.full((h, w), cv2.GC_BGD, np.uint8)
    mask[zone] = cv2.GC_PR_BGD
    mask[bright] = cv2.GC_PR_FGD
    mask[cv2.erode(bright.astype(np.uint8), disk(21)) > 0] = cv2.GC_FGD
    mask[(L < 16) & zone] = cv2.GC_BGD
    m = clean(grabcut(img, mask), 5000, 4000)
    # brush: handle + ferrule + bristles along one straight axis, tapering to the tip
    (x0, y0), (x1, y1) = brush_axis
    d = np.array([x1 - x0, y1 - y0], np.float32)
    n = np.array([-d[1], d[0]]) / np.linalg.norm(d)
    w0, w1 = brush_width
    pts = [(x0 + n[0] * w0, y0 + n[1] * w0), (x1 + n[0] * w1, y1 + n[1] * w1),
           (x1 - n[0] * w1, y1 - n[1] * w1), (x0 - n[0] * w0, y0 - n[1] * w0)]
    brush = poly((h, w), pts).astype(np.uint8) * 255
    # tighten the brush polygon to the brush pixels (it is lighter or darker than the cloth next to it)
    m = np.maximum(m, brush)
    save_cutout(img, feather(m), name)


def work():
    img = cv2.imread(str(ROOT / "originals/work-original.png"))[:, :, :3]
    h, w = img.shape[:2]
    L, a, b = lab(img)
    warm = ((b > 9) & (a < 45)).astype(np.uint8)
    warm = cv2.morphologyEx(warm, cv2.MORPH_OPEN, disk(5))
    cold = ((b < 1) | (a > 50)).astype(np.uint8)
    mask = np.full((h, w), cv2.GC_PR_BGD, np.uint8)
    mask[warm > 0] = cv2.GC_PR_FGD
    mask[cv2.erode(warm, disk(15)) > 0] = cv2.GC_FGD
    mask[cv2.erode(cold, disk(9)) > 0] = cv2.GC_BGD
    # beige lamp body seen between and beside the right-hand fingers (warm, but background)
    lamp = [
        [(1222, 786), (1344, 752), (1344, 932), (1128, 932), (1158, 884), (1196, 826)],
        [(1012, 893), (1042, 893), (1048, 925), (1038, 962), (1008, 962)],
    ]
    for p in lamp:
        mask[poly((h, w), p)] = cv2.GC_BGD
    m = clean(grabcut(img, mask), 20000, 3000)
    save_cutout(img, feather(m), "work-fg")


def logo():
    """Symbol only (disc, A, branch), no wordmark: header mark and the large services mark."""
    img = cv2.imread(str(ROOT / "originals/Amanails-logo-transparent.png"), cv2.IMREAD_UNCHANGED)
    symbol = img[120:986, 180:1030]
    cv2.imwrite(str(SRC / "logo-symbol.png"), symbol)
    # line-art version for the blush section: the filled disc is dropped, strokes and A stay
    bgr = symbol[:, :, :3].astype(np.float32)
    L, a, b = lab(symbol[:, :, :3])
    alpha = symbol[:, :, 3].astype(np.float32)
    ink = np.clip((62 - L) / 22, 0, 1)  # dark brown strokes and the A; the blush disc is L~70
    line = np.dstack([symbol[:, :, :3], (alpha * ink).astype(np.uint8)])
    cv2.imwrite(str(SRC / "logo-line.png"), line)
    print("logo: symbol + line-art written")


if __name__ == "__main__":
    hero(ROOT / "images-master/hero.png", "hero-fg",
         finger_zone=[(1040, 600), (1300, 470), (1672, 360), (1672, 941), (1040, 941)],
         brush_axis=((1690, 64), (1188, 655)), brush_width=(22, 2))
    hero(ROOT / "images-master/hero-mobile.png", "hero-mobile-fg",
         finger_zone=[(560, 900), (900, 720), (1122, 640), (1122, 1180), (560, 1180)],
         brush_axis=((1140, 330), (722, 880)), brush_width=(20, 2))
    work()
    logo()
