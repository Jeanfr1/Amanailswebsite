"""v2 masters from the Higgsfield deliveries (higgsfield/entregas/, kept out of git).

Writes into assets-src/ (also local only), read by scripts/images.mjs:
  hero-wide-end.png    wide opening plate with the satin ribbon (2476:1061, 4K): the still
                       for motion-off / no video, and the film's last frame
  hero-fg-v2.png       finger + brush cut-out of the kit frame, cut from the 4K wide plate
  hero-m-end.png       phone opening plate (9:16, the kit's 4:5 frame outpainted) with ribbon
  hero-m-fg-v2.png     its finger + brush cut-out
  macro-wide.png       macro with 880 px more satin on the left, 60 px above and below
  macro-m.png          vertical macro for phones
  satin-*.png          satin ribbons shot on black, turned into RGBA (alpha = brightness)

Geometry: the wide plates carry the kit frame at x 402..2074 (of 2476) and y 0..941;
the phone plate carries the kit's 1122 x 1402 frame at y 420 (of 1995).
"""
from pathlib import Path

import cv2
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
IN = ROOT / "higgsfield/entregas"
SRC = ROOT / "assets-src"
QA = ROOT / "qa"


def read(name, flags=cv2.IMREAD_COLOR):
    img = cv2.imread(str(IN / name), flags)
    if img is None:
        raise SystemExit(f"missing higgsfield/entregas/{name}")
    return img


def cutout(plate, alpha_kit, box, name, full_frame=False):
    """Kit-frame cut-out (alpha from the v1 GrabCut) re-cut from a sharper plate;
    full_frame keeps the whole plate canvas (transparent outside the kit frame)."""
    x0, y0, x1, y1 = box
    a = cv2.resize(alpha_kit, (x1 - x0, y1 - y0), interpolation=cv2.INTER_LINEAR)
    if full_frame:
        full = np.zeros(plate.shape[:2], np.uint8)
        full[y0:y1, x0:x1] = a
        rgba = np.dstack([plate, full])
    else:
        rgba = np.dstack([plate[y0:y1, x0:x1], a])
    cv2.imwrite(str(SRC / name), rgba)
    print(f"{name}: {rgba.shape[1]}x{rgba.shape[0]}")


def unscreen(name, out, pad=24):
    """A ribbon on pure black -> RGBA: alpha = brightness, colour un-premultiplied."""
    img = read(name).astype(np.float32) / 255
    m = img.max(axis=2)
    a = np.clip((m - 0.035) / (1 - 0.035), 0, 1)  # the black point drops sensor noise
    a = cv2.GaussianBlur(a, (0, 0), 0.6)
    rgb = np.clip(img / np.maximum(a, 1e-3)[:, :, None], 0, 1)
    ys, xs = np.where(a > 0.02)
    y0, y1 = max(0, ys.min() - pad), min(a.shape[0], ys.max() + pad)
    x0, x1 = max(0, xs.min() - pad), min(a.shape[1], xs.max() + pad)
    rgba = np.dstack([rgb, a])[y0:y1, x0:x1]
    cv2.imwrite(str(SRC / out), (rgba * 255).round().astype(np.uint8))
    print(f"{out}: {x1 - x0}x{y1 - y0} (crop y {y0}..{y1} of {a.shape[0]}, x {x0}..{x1} of {a.shape[1]})")


if __name__ == "__main__":
    SRC.mkdir(exist_ok=True)
    QA.mkdir(exist_ok=True)

    # desktop opening: the wide end plate and the kit-frame cut-out at 4K
    end = read("H2w-hero-final-4k.png")
    cv2.imwrite(str(SRC / "hero-wide-end.png"), end)
    start = read("H1w-hero-largo-4k.png")
    k = start.shape[1] / 2476
    kit_alpha = cv2.imread(str(SRC / "hero-fg.png"), cv2.IMREAD_UNCHANGED)[:, :, 3]
    cutout(end, kit_alpha, (round(402 * k), 0, round(2074 * k), round(941 * k)), "hero-fg-v2.png")

    # phone opening
    m_end = read("M2-celular-final-4k.png")
    cv2.imwrite(str(SRC / "hero-m-end.png"), m_end)
    km = m_end.shape[1] / 1122
    m_alpha = cv2.imread(str(SRC / "hero-mobile-fg.png"), cv2.IMREAD_UNCHANGED)[:, :, 3]
    cutout(m_end, m_alpha, (0, round(420 * km), m_end.shape[1], round((420 + 1402) * km)), "hero-m-fg-v2.png", full_frame=True)

    # macro
    cv2.imwrite(str(SRC / "macro-wide.png"), read("D1w-macro-larga.png"))
    cv2.imwrite(str(SRC / "macro-m.png"), read("D2-macro-celular-4k.png"))

    # ribbons
    unscreen("R5-fita-fina.png", "satin-wave.png")
    unscreen("R5-fita-fina-v3.png", "satin-wave-2.png")
    unscreen("R2-fita-diagonal-v2.png", "satin-diagonal.png")
