<div align="center">

<img src=".github/assets/banner.png" alt="Amanails Hamburg: Eine Linie. Dein Stil." width="100%" />

<h3>A one-page website for a Hamburg nail studio that opens with one gesture: a fine brush releases a rosé satin ribbon.</h3>

<p>
  <a href="https://amanails-hamburg.vercel.app"><strong>🌐 Live site</strong></a>
  &nbsp;·&nbsp;
  <a href="#hero-animation"><strong>🎬 How the hero works</strong></a>
  &nbsp;·&nbsp;
  <a href="#getting-started"><strong>🛠️ Run it locally</strong></a>
</p>

<p>
  <a href="https://amanails-hamburg.vercel.app"><img src="https://img.shields.io/badge/Vercel-Live-4B2D18?style=for-the-badge&logo=vercel&logoColor=white" alt="Live on Vercel" /></a>
  <img src="https://img.shields.io/badge/Vite-6-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 6" />
  <img src="https://img.shields.io/badge/Motion-vanilla_rAF-BFA398?style=for-the-badge" alt="Vanilla requestAnimationFrame motion" />
  <img src="https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/♿_Accessibility-first-C29A8A?style=for-the-badge" alt="Accessibility first" />
</p>

</div>

<br />

## 🚀 Overview

**Amanails** does manicure, pedicure and nail design in Hamburg's Wendenstraße. The approved direction, *Gesto*, turns the studio's craft into a single gesture: a fine brush lifts from a nude nail and a satin ribbon of rosé lacquer unfurls from its tip. The same satin then rides the edges between the scenes, from the macro shot to the real work, the one blush pause with the services and the studio itself.

The desktop page is the client's approved board rebuilt at the density of a desktop page; the phone layout keeps the same story in one column. Everything leads to one action: **Termin anfragen**, which opens a short sheet with Instagram, phone and address. There is no booking engine and no fake confirmation.

- **Board-exact, at the right scale**: text, logo, photos and contours placed in board units measured from the approved mockup, drawn at the density of a 1,024 px board so nothing reads as a zoomed-in crop
- **A filmed gesture, not a drawn line**: the opening is a short film generated from the scene's own first and last frames; the satin on the edges is photographed ribbon, not vector strokes
- **Type behind the subject**: the title sits behind the finger and the brush, *DEIN.* sits behind the client's real hands
- **Real studio, real work**: the two documentary photos are shown as they are; the full work photo opens byte-for-byte as received
- **Measured weight**: about 1.5 MB for the whole page on desktop (0.54 MB of it the film) and 0.9 MB on a phone (0.33 MB film), AVIF/WebP images, WebM/MP4 film, self-hosted fonts, no library

<br />

<a name="hero-animation"></a>

## 🎬 The hero animation

<div align="center">
  <a href="https://amanails-hamburg.vercel.app"><img src=".github/assets/hero-scroll.gif" alt="The brush releases a rosé satin ribbon that loops behind the title, the title rises behind the finger, then the satin detail scene slides up over the pinned opening scene" width="100%" /></a>
  <sub>The opening film at its real pace, then the scroll into the next scene · captured at 1440 × 900</sub>
</div>

<br />

The opening scene is pinned for 0.65 screen heights on desktop (0.4 on phones) while the next scene slides over it:

| Moment          | What happens                                                                                              |
| :-------------- | :-------------------------------------------------------------------------------------------------------- |
| Load            | The film's first frame is on screen: brush on the nail, nothing else moving; logo and note fade in        |
| 0–5.2 s         | The brush lifts and a satin ribbon unfurls from its tip, loops behind the title and leaves on the left    |
| From 1.1 s      | *Eine Linie.* and *Dein Stil.* rise from their own masks, behind the finger, while the ribbon is in the air |
| End             | The film rests on its last frame; it plays once, muted, and never loops                                   |
| Scroll          | The satin scene *Von der Idee zum Detail.* rises over the pinned scene, a thin satin ribbon along its edge |
| After the pin   | A compact bar with the logo, navigation and **Termin anfragen** slides in                                 |

**Under the hood**

- 📐 **Drawn at desktop density.** The approved board is only 760 px wide. Scaling it to the window drew everything at 1.9×; the page now maps board pixels at the density of a 1,024 px board (`1u = min(width, 1600px) / 1024`), centres the board and lets photos and colour run to the page edges. `npm run qa` checks it at 1280, 1440 and 1920 px: every scene under 0.8 screen heights, section titles under 7.5% of the width, no text under 11 px.
- 🖼️ **Photos at the board's own scale.** The opening plate and the macro were registered on the board with SIFT (0.5 board px per photo px) and are placed in board units instead of covering the viewport. To reach the screen edges without zooming in, both were extended with more of the same scene (Higgsfield, FLUX.2 Pro Outpaint, which keeps the original pixels).
- 🎞️ **A film made from its own end frames.** The last frame is the start plate with a satin ribbon added (GPT Image 2.5), registered back onto the plate so only the ribbon is new. MiniMax H3 animated between the two fixed frames with a locked camera. The film was SIFT-registered against the plate (scale 0.8415) and is placed with those numbers, so it sits exactly where the still sits.
- ✂️ **Two copies of one plate.** A cut-out of the finger and brush (OpenCV GrabCut, re-cut from the 4K plate) stays in front of the film; the finger does not move in the film (measured drift under 5/255), so the title can pass behind it the whole time.
- 🎀 **Satin, photographed.** The ribbons were generated on pure black and turned into transparent images (alpha = brightness), then placed under the wave edges so their high ends tuck under the scene above. Each wipes in once and drifts 1.5% with the scroll.
- 🐢 **Graceful by default.** `prefers-reduced-motion`, `?static`, data saver or the footer's **Bewegung pausieren** button show the film's last frame as a still and never download the film; the pin, transforms and reveals go away. Without JavaScript the page is complete and static.

<br />

## 🖥️ Sections

<div align="center">
  <img src=".github/assets/desktop-sections.jpg" alt="Desktop screenshots: the satin detail scene, DEIN. behind the real hands, the blush services pause with a satin ribbon on its edge and the studio contact scene with the diagonal ribbon" width="100%" />
</div>

<br />

| #   | Section                                  | Anchor        | Role                                                                                                   |
| :-- | :--------------------------------------- | :------------ | :----------------------------------------------------------------------------------------------------- |
| 01  | **Eine Linie. Dein Stil.**               | `#start`      | The brush film; title behind the finger                                                                |
| 02  | **Von der Idee zum Detail.**             | `#detail`     | Macro on satin at the board's scale, anchored to the page edge; a thin ribbon along its edge           |
| 03  | **Nägel mit Charakter.** *DEIN.*         | `#arbeiten`   | The studio's real work; the five letters rise one by one behind the hands; full photo and Instagram    |
| 04  | **Für dich.**                            | `#leistungen` | The only solid section (#BFA398), a ribbon on its edge; the logo turns slowly; Maniküre, Pediküre, Nageldesign |
| 05  | **Dein Moment bei Amanails.**            | `#studio`     | The real studio photo with the board's diagonal ribbon; **Termin anfragen**, directions; the footer sits on the same photo |

<br />

## 📱 Mobile first, motion optional

<div align="center">
  <img src=".github/assets/mobile-screens.jpg" alt="Phone screenshots: opening scene with the ribbon, detail, DEIN. behind the hands, services and studio contact" width="100%" />
</div>

<br />

- Its own vertical film and plate (9:16, outpainted from the kit's 4:5 frame) and a vertical macro; the desktop plates and film are never downloaded on phones
- Shorter pin, title at the top over the dark bokeh
- The studio photo becomes a top band that melts into the contact block, so the neon sign never sits behind the heading
- Full-screen menu, touch targets of at least 44 px, no horizontal scroll at 360 px

<br />

## ✨ Highlights

- **🎞️ One gesture, one material**: the brush film opens the page and the same satin returns on the scene edges and across the studio
- **🔠 A different move per scene**: film and title rise, mask-rise lines, letter-by-letter *DEIN.* behind the hands, the logo turning in the blush pause, studio copy rising in, satin wiping in
- **🗓️ Honest booking**: **Termin anfragen** opens Instagram, phone and address. The services open short descriptions with the same call to action
- **🖼️ Untouched originals**: the work photo dialog loads `originals/work-original.png`, the exact file received (hash-checked in QA)
- **🧪 Browser QA**: 68 checks on the production build and on the live site, from photo scale and the film's end state to dialogs, reduced motion and no-JS
- **🔎 Ready to share**: Open Graph image, `NailSalon` structured data, favicons; `noindex` until the final domain is set

<br />

## 💻 Tech stack

| <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/vitejs/vitejs-original.svg" width="40" height="40" /><br />Vite 6 | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" width="40" height="40" /><br />JavaScript | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg" width="40" height="40" /><br />HTML5 | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" width="40" height="40" /><br />CSS3 | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/opencv/opencv-original.svg" width="40" height="40" /><br />OpenCV | <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/playwright/playwright-original.svg" width="40" height="40" /><br />Playwright | <img src="https://cdn.simpleicons.org/vercel/000000/ffffff" width="40" height="40" /><br />Vercel |
| :---: | :---: | :---: | :---: | :---: | :---: | :---: |

### Why this stack?

- **Vite + plain JavaScript**: one static page and one small module; the motion is a single `requestAnimationFrame` loop that only runs while the page scrolls, and the film is a plain `<video>`
- **Higgsfield for the generated imagery**: outpainted plates, the satin ribbons and the keyframed film, all made from the approved scene so they register with it
- **OpenCV + sharp + FFmpeg**: registration, cut-outs, the AVIF/WebP pipeline and the WebM/MP4 film are scripts in the repo, so every asset can be rebuilt
- **Self-hosted Bodoni Moda + Manrope**: the kit's typefaces as WOFF2, no third-party font requests
- **Playwright**: real clicks, scroll and captures against the production build
- **Vercel**: every push to `main` deploys automatically

<br />

## 🎨 Design system

| Token    | Value                                                                       | Use                                         |
| :------- | :-------------------------------------------------------------------------- | :------------------------------------------ |
| Espresso | ![#4B2D18](https://img.shields.io/badge/%234B2D18-4B2D18?style=flat-square) | Type on blush, dialogs, logo                |
| Blush    | ![#BFA398](https://img.shields.io/badge/%23BFA398-BFA398?style=flat-square) | The single solid section                    |
| Rosé     | ![#C29A8A](https://img.shields.io/badge/%23C29A8A-C29A8A?style=flat-square) | Primary button, the satin                   |
| Ivory    | ![#F5F0EA](https://img.shields.io/badge/%23F5F0EA-F5F0EA?style=flat-square) | Type on photos, dialogs                     |
| Night    | ![#1D100B](https://img.shields.io/badge/%231D100B-1D100B?style=flat-square) | Page ground, compact bar                    |

- **Type**: Bodoni Moda for display (92 board units for the title, −0.06 em), Manrope for navigation and spaced caps (0.3 em tracking); small text never under 11 px
- **Units**: `1u` = min(page width, 1,600 px) ÷ 1,024, the density of a desktop board; the 760u board is a centred frame and photos bleed past it. The opening scene uses `1hu = min(1u, 100svh ÷ 440)` so it always fits the first screen
- **Contours**: each scene's top edge is the board's own boundary as a clip path
- **Motion**: the film plays once; everything else enters once or follows the scroll; nothing loops while the page is still

<br />

<a name="getting-started"></a>

## 🛠️ Getting started

```bash
# Clone the repository
git clone https://github.com/Jeanfr1/Amanailswebsite.git
cd Amanailswebsite

# Install dependencies (Node 20.9+)
npm install

# Start the dev server  →  http://localhost:5317
npm run dev

# Production build  →  dist/
npm run build

# Preview the production build  →  http://localhost:4317
npm run preview

# Browser QA (68 checks) and the board comparison, against the preview
npm run qa
npm run compare

# Rebuild the images: cut-outs (Python + OpenCV), the Higgsfield masters, then AVIF/WebP and the film
npm run prepare-images
npm run prepare-higgsfield   # reads higgsfield/entregas/ (kept out of git)
npm run images
npm run film                 # needs FFmpeg with libx264, libvpx-vp9 and libwebp
```

<br />

## 📁 Project structure

```
Amanailswebsite/
├── index.html                  # Every scene: start → detail → arbeiten → leistungen → studio (+ footer, dialogs, contour clip paths)
├── src/
│   ├── main.js                 # Opening film, pin, satin and per-scene motion, menu, dialogs, pause
│   ├── style.css               # Board units, scenes, film and satin, phone layout, motion-off states
│   ├── board.json              # Text blocks measured on the approved board
│   └── images.json             # Image sizes written by the pipeline
├── public/
│   ├── img/                    # AVIF/WebP plates, cut-outs, satin ribbons, logo (generated, versioned names)
│   ├── film/                   # The opening film, desktop 21:9 and phone 9:16, WebM + MP4
│   ├── originals/              # The two client photos, byte-identical
│   └── fonts/                  # Bodoni Moda + Manrope (WOFF2, OFL)
├── scripts/
│   ├── prepare-images.py       # GrabCut cut-outs (finger + brush, hands) and logo symbol / line art
│   ├── prepare-higgsfield.py   # Chosen Higgsfield deliveries → plates, 4K cut-outs, transparent ribbons
│   ├── images.mjs · film.mjs   # sharp pipeline (+ Open Graph card, favicons) and FFmpeg film encodes
│   ├── measure-board.py        # Ink boxes of every text block on the board
│   ├── contours.mjs            # Board boundaries → clip paths
│   ├── qa.mjs · compare.mjs    # Browser QA and page-vs-board comparison
│   └── readme-assets.mjs       # Captures for this README (+ readme-composite.py)
├── higgsfield/                 # PROMPTS-HIGGSFIELD.md: every prompt and the log of chosen files
├── docs/ · roteiros/ · animation/ · images-master/ · originals/ · site/ · tools/
│                               # The design kit, kept as received (LEIA-ME-KIT.md); never deployed
└── vercel.json                 # Vite, dist, noindex header, immutable cache for /img, /film and /fonts
```

<br />

## 🚀 Deployment

Hosted on **Vercel** and connected to this repository: every push to `main` ships to production.

**Live site:** [amanails-hamburg.vercel.app](https://amanails-hamburg.vercel.app)

| Setting          | Value           |
| :--------------- | :-------------- |
| Framework        | Vite            |
| Build command    | `npm run build` |
| Output directory | `dist`          |

<br />

## 📌 Content checklist

Items waiting on the studio. Each one is marked `TODO(amanails)` in the code.

- [ ] **Impressum** and **Datenschutzerklärung** (required in Germany before going public); links go in the footer
- [ ] Final domain, then drop `noindex` (`index.html`, `vercel.json`, `public/robots.txt`) and set `canonical` + `og:url`
- [ ] Permission to publish the work photo and the studio photo
- [ ] Sign-off on the generated imagery (opening plate and film, macro, satin ribbons). If a note on image sources is wanted, it belongs in the Impressum
- [ ] Wording of the three service descriptions
- [ ] Vector logo master (the current mark is a raster reconstruction from the kit)

Choices made where the kit and the board disagreed:

- The board's *DEIN.* is taller than Bodoni Moda can be at that width; the word is fitted to the board's width (cap height 210u instead of 258u)
- The board reinterprets the work and studio photos; the page uses the original photos, as the kit asks
- The board's ribbons are rendered satin; the page uses photographed satin ribbons and a filmed gesture instead of vector lines
- The kit's visible photo labels and the "Bildhinweise" dialog are not on the page; that information lives here and in the code
- Copy that is in the kit but not on the board (eyebrows, extra lines) was left out to match the approved board

<br />

## 🙏 Acknowledgments

- **Amanails** for the brief, the photos and the approved *Gesto* direction
- **[Bodoni Moda](https://fonts.google.com/specimen/Bodoni+Moda)** by Owen Earl and **[Manrope](https://fonts.google.com/specimen/Manrope)** by Mikhail Sharanda (OFL)
- **[Higgsfield](https://higgsfield.ai)** for the outpainted plates, the satin ribbons and the opening film
- **[OpenCV](https://github.com/opencv/opencv)**, **[sharp](https://sharp.pixelplumbing.com)** and **[FFmpeg](https://ffmpeg.org)** for the image and film pipeline
- **[Vite](https://vite.dev)**, **[Playwright](https://playwright.dev)** and **[Vercel](https://vercel.com)**

<br />

---

<div align="center">
  <img src="public/apple-touch-icon.png" width="44" height="44" alt="" />
  <p><strong>Eine Linie. Dein Stil.</strong></p>
  <p>Built with ❤️ by <a href="https://github.com/Jeanfr1">Jean</a> for Amanails Hamburg</p>
  <sub>© 2026 Amanails Hamburg. All rights reserved.</sub>
</div>
