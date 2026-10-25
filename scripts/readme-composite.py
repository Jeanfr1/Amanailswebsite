#!/usr/bin/env python3
"""Compose the README assets from qa/readme/ (node scripts/readme-assets.mjs):
browser-framed desktop sections, phone-framed screens, banner and the GIF.
Output: .github/assets/
"""
from pathlib import Path
import subprocess
from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "qa/readme"
OUT = ROOT / ".github/assets"
OUT.mkdir(parents=True, exist_ok=True)
BG = (29, 16, 11)


def rounded(im, r):
    mask = Image.new("L", im.size, 0)
    ImageDraw.Draw(mask).rounded_rectangle([0, 0, im.width - 1, im.height - 1], r, fill=255)
    out = Image.new("RGBA", im.size)
    out.paste(im, (0, 0), mask)
    return out


def shadow(size, r, blur=26, alpha=120):
    s = Image.new("RGBA", (size[0] + blur * 4, size[1] + blur * 4), (0, 0, 0, 0))
    ImageDraw.Draw(s).rounded_rectangle([blur * 2, blur * 2, blur * 2 + size[0], blur * 2 + size[1]], r, fill=(0, 0, 0, alpha))
    return s.filter(ImageFilter.GaussianBlur(blur))


def browser(shot, width=880):
    im = Image.open(shot).convert("RGB")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    bar = 34
    win = Image.new("RGB", (width, im.height + bar), (40, 27, 22))
    d = ImageDraw.Draw(win)
    for i, c in enumerate([(237, 106, 94), (245, 191, 79), (98, 197, 84)]):
        d.ellipse([16 + i * 20, 12, 27 + i * 20, 23], fill=c)
    d.rounded_rectangle([width * .3, 8, width * .7, 26], 9, fill=(58, 41, 34))
    d.text((width * .5, 17), "amanails-hamburg.vercel.app", fill=(205, 186, 172), anchor="mm")
    win.paste(im, (0, bar))
    return rounded(win, 12)


def phone(shot, width=300):
    im = Image.open(shot).convert("RGB")
    im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    pad = 11
    body = Image.new("RGBA", (width + pad * 2, im.height + pad * 2), (0, 0, 0, 0))
    ImageDraw.Draw(body).rounded_rectangle([0, 0, body.width - 1, body.height - 1], 46, fill=(12, 8, 7))
    body.paste(rounded(im, 36), (pad, pad), rounded(im, 36))
    return body


def sheet(items, cols, gap, margin, out, bg=BG):
    w = max(i.width for i in items)
    h = max(i.height for i in items)
    rows = (len(items) + cols - 1) // cols
    canvas = Image.new("RGBA", (margin * 2 + cols * w + (cols - 1) * gap, margin * 2 + rows * h + (rows - 1) * gap), bg + (255,))
    for k, it in enumerate(items):
        x = margin + (k % cols) * (w + gap)
        y = margin + (k // cols) * (h + gap)
        sh = shadow(it.size, 18)
        canvas.alpha_composite(sh, (x - 52, y - 40))
        canvas.alpha_composite(it, (x, y))
    canvas.convert("RGB").save(out, quality=86, optimize=True, progressive=True)
    print(out.name, canvas.size, round(out.stat().st_size / 1024), "KB")


sheet([browser(SRC / f"desk-{n}.png") for n in ["detail", "work", "services", "studio"]], 2, 56, 64, OUT / "desktop-sections.jpg")
sheet([phone(p) for p in sorted(SRC.glob("phone-*.png"))], 5, 40, 56, OUT / "mobile-screens.jpg")
Image.open(SRC / "banner.png").convert("RGB").save(OUT / "banner.png", optimize=True)
print("banner.png", round((OUT / "banner.png").stat().st_size / 1024), "KB")

frames = sorted((SRC / "frames").glob("f_*.png"))
subprocess.run([
    "ffmpeg", "-y", "-loglevel", "error", "-framerate", "10", "-i", str(SRC / "frames/f_%04d.png"),
    "-vf", "fps=10,scale=720:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=80:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle",
    "-loop", "0", str(OUT / "hero-scroll.gif")], check=True)
print("hero-scroll.gif", len(frames), "frames", round((OUT / "hero-scroll.gif").stat().st_size / 1024), "KB")
