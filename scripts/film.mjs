// The opening film for the web: npm run film
// Sources (Higgsfield, MiniMax H3 with fixed first and last frames) live in
// higgsfield/entregas/ and stay out of git. Writes public/film/ (MP4 H.264 +
// WebM VP9, silent, faststart) and the first frames as posters in public/img/.
// Desktop film = the wide plate (2476 x 1061) scaled by 0.8415 and 8.5 plate px
// lower (SIFT on its first and last frames); see .hero-film in src/style.css.
import { execFileSync } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const V = 2;
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const IN = path.join(ROOT, 'higgsfield/entregas');
const OUT = path.join(ROOT, 'public/film');
await mkdir(OUT, { recursive: true });

const films = [
  // name, source, width
  ['hero', 'V1-hero-desktop.mp4', 2048],
  ['hero-m', 'V2-hero-celular.mp4', 720],
];
const ff = (args) => execFileSync('ffmpeg', ['-v', 'error', '-y', ...args], { stdio: 'inherit' });

for (const [name, src, w] of films) {
  const input = path.join(IN, src);
  const scale = `scale=${w}:-2:flags=lanczos`;
  ff(['-i', input, '-an', '-vf', scale, '-c:v', 'libx264', '-profile:v', 'high', '-preset', 'slow', '-crf', '22', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', path.join(OUT, `${name}-v${V}-${w}.mp4`)]);
  ff(['-i', input, '-an', '-vf', scale, '-c:v', 'libvpx-vp9', '-crf', '33', '-b:v', '0', '-row-mt', '1', '-deadline', 'good', '-cpu-used', '2', path.join(OUT, `${name}-v${V}-${w}.webm`)]);
  ff(['-i', input, '-vf', `${scale}`, '-frames:v', '1', '-c:v', 'libwebp', '-quality', '80', path.join(ROOT, 'public/img', `${name}-start-v${V}-${w}.webp`)]);
}
console.log('films written to public/film (v' + V + ')');
