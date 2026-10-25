// Shared Playwright launcher. Uses the Chromium already cached on this Mac
// (Playwright's own download is not required); override with CHROME=<path>.
import { chromium } from 'playwright';
import { existsSync } from 'node:fs';
import os from 'node:os';

const cached = `${os.homedir()}/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-x64/chrome-headless-shell`;

export async function launch() {
  const executablePath = process.env.CHROME || (existsSync(cached) ? cached : undefined);
  return chromium.launch({ executablePath, args: ['--hide-scrollbars', '--force-color-profile=srgb'] });
}

export const BASE = process.env.QA_BASE || 'http://localhost:4317/';

// scroll in small wheel-like steps so the page's own loop runs as for a visitor
export async function scrollToY(page, y, { step = 120, settle = 900 } = {}) {
  await page.evaluate(async ({ y, step }) => {
    const raf = () => new Promise((r) => requestAnimationFrame(r));
    let cur = scrollY;
    while (Math.abs(cur - y) > step) { cur += Math.sign(y - cur) * step; scrollTo(0, cur); await raf(); }
    scrollTo(0, y); await raf();
  }, { y, step });
  await page.waitForTimeout(settle);
}
