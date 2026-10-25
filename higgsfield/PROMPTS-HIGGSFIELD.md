# Amanails v2 · Tudo que precisa ser gerado no Higgsfield

**Para quê:** a linha vetorial fina e o zoom exagerado saem do site. No lugar entram:

1. Um vídeo curto do pincel soltando uma fita de laca/cetim rosé (abertura, desktop e celular).
2. Fitas de cetim reais, fotográficas, para as transições entre as seções (como no board).
3. Versões 4K nítidas das cenas geradas (abertura e macro) e uma macro vertical para o celular.

**O que NÃO vai para o Higgsfield:** a foto das mãos (seção 03) e a foto do estúdio (seção 05). São fotos reais da cliente e o kit proíbe recriá-las ou ampliá-las. Para o estúdio, só uma foto maior enviada pela dona resolve.

---

## Antes de começar

**Imagens de referência** (já separadas para você): `higgsfield/referencias/`

| Arquivo | O que é |
| :-- | :-- |
| `00-board-aprovado.png` | O board que a cliente aprovou (direção geral) |
| `01-hero-desktop.png` | Imagem atual da abertura, desktop (16:9) |
| `02-hero-celular.png` | Imagem atual da abertura, celular (4:5) |
| `03-macro.png` | Imagem atual da seção 02, macro das unhas (16:9) |
| `04-board-fita-hero.png` | Recorte do board: a fita saindo do pincel |
| `05-board-fitas-transicao.png` | Recorte do board: as fitas nas bordas entre seções |
| `06-board-fita-estudio.png` | Recorte do board: a fita diagonal no estúdio |

**Onde salvar o que gerar:** `higgsfield/entregas/`, com os **nomes exatos** de cada item (ex.: `H2-hero-final-4k.png`). Se gerar variações, salve como `H2-hero-final-4k-v2.png`, `-v3`… e eu escolho a melhor.

**Modelos sugeridos**
- **Imagens fiéis a uma referência** (H1, H2, M1, M2, D1, D2): **Nano Banana Pro**. É o mais fiel para editar sem mudar a composição. Alternativa: **Seedream 5.0 4K** com a imagem anexada como referência.
- **Imagens novas** (fitas R1–R4): **Seedream 5.0 4K**.
- **Vídeos** (V1, V2, V3): um modelo com **primeiro e último quadro** ("Start/End frame"), como **Kling** ou **Veo 3.1**, o que estiver disponível. Sem áudio.
- Lembrete: o Seedream não tem 4:5. Para formatos verticais use **9:16** ou **3:4**.

**Regras que valem para TUDO**
- Nenhum texto, letra, logo, marca d'água ou interface dentro das imagens. O texto é colocado pelo site.
- Paleta da marca: espresso `#4B2D18`, blush `#BFA398`, rosé `#C29A8A`, marfim `#F5F0EA`. Fita: rosé-dourado do claro `#F0C8B4` ao escuro `#B9806C`.
- Dedos e unhas com anatomia perfeita: 5 dedos por mão, sem dedos fundidos ou extras, unhas em formato amêndoa iguais às da referência.

**Ordem e prioridade** (se os créditos forem limitados, gere de cima para baixo):

| Prioridade | Itens | Por quê |
| :-- | :-- | :-- |
| 1 | H1 → H2 → V1 | A abertura (o "gesto"). É o que mais muda o site |
| 2 | R1, R2, R3 | Fitas das transições no desktop |
| 3 | M1 → M2 → V2, R4 | A abertura e a fita no celular |
| 4 | D1, D2 | Macro nítida e macro vertical |
| 5 | V3 (opcional) | Fita viva em loop |

---

## 1 · ABERTURA DESKTOP

### H1 · `H1-hero-inicio-4k.png` — a imagem de abertura, nítida, sem mudanças

**Uso no site:** primeiro quadro do vídeo e imagem de fundo da abertura.
**Referência:** `01-hero-desktop.png` · **Modelo:** Nano Banana Pro · **Formato:** 16:9 · **Resolução:** 4K (3840×2160)

**Prompt**
```
Recreate this exact photograph at 4K resolution with no changes to the composition: same camera angle, same framing, same position and size of the finger, the nude almond nail, the fine nail-art brush, the rosé jar and the dark brown textured cloth. Keep the soft dark bokeh in the upper left and center. Increase only clarity and fine detail: skin texture, glossy nail reflection, brush bristles, cloth fibres. Warm, low-key studio lighting, premium beauty campaign look. No text, no logo, no added objects.
```
**Evitar (se houver campo negativo):** `text, letters, watermark, extra fingers, changed composition, different nail shape, zoom, crop`

**Conferir antes de salvar**
- [ ] Sobreposta à `01-hero-desktop.png`, a imagem bate: o dedo, a unha e o pincel estão no mesmo lugar.
- [ ] O lado esquerdo e o centro continuam escuros e limpos (é onde fica o título).

---

### H2 · `H2-hero-final-4k.png` — a mesma imagem, com a fita saindo do pincel

**Uso no site:** último quadro do vídeo. É o que fica na tela quando a animação termina (e é a imagem fixa para quem desliga animações). Tem que lembrar o board (`04-board-fita-hero.png`).
**Referência:** `H1-hero-inicio-4k.png` (a que você acabou de gerar) + `04-board-fita-hero.png` como referência de estilo · **Modelo:** Nano Banana Pro · **Formato:** 16:9 · **4K**

**Prompt**
```
Edit this photograph and keep everything exactly as it is: the finger, the nude almond nail, the nail-art brush, the jar, the dark cloth, the lighting and the framing do not change.
Add one single satin ribbon of glossy rosé-gold lacquer that flows out of the very tip of the brush bristles, as if the brush has just painted it into the air. The ribbon is thin and elegant (about 1% of the image height), flat like fine satin, with soft metallic highlights along its folds and a gentle twist, colours from light rosé #F0C8B4 to deep rosé #B9806C.
Path of the ribbon: it leaves the bristle tip on the right, sweeps down and to the left just below the vertical middle of the frame, passes under the centre, rises in one soft open loop in the left-centre area, and leaves the frame through the left edge in the upper third. It never covers the nail or the fingertip, never touches the top 12% of the image and never enters the top-left corner.
The ribbon casts a very faint warm glow on the cloth below it. Photorealistic, premium beauty campaign, shallow depth of field consistent with the original. No text, no logo.
```
**Evitar:** `thick ribbon, multiple ribbons, neon, cartoon, vector line, wire, rope, text, letters, changed finger, extra fingers, ribbon over the nail`

**Conferir**
- [ ] Dedo, unha e pincel idênticos à H1 (sobreponha as duas).
- [ ] Uma fita só, fina, brilhante, com cara de cetim/laca. Não pode parecer fio, corda ou neon.
- [ ] A fita nasce na ponta do pincel e sai pela borda esquerda, no terço de cima.
- [ ] O canto superior esquerdo e a faixa do topo estão livres (logo e menu ficam ali).

---

### V1 · `V1-hero-desktop.mp4` — o gesto: o pincel solta a fita

**Uso no site:** toca uma vez quando a página abre, sem som, e para no último quadro. O título "Eine Linie. Dein Stil." aparece por cima.
**Modelo:** vídeo com primeiro e último quadro (Kling ou Veo 3.1) · **Primeiro quadro:** `H1-hero-inicio-4k.png` · **Último quadro:** `H2-hero-final-4k.png` · **Formato:** 16:9 · **Resolução:** a maior disponível (1080p ou mais) · **Duração:** 5 s (até 6 s) · **Sem áudio**

**Prompt**
```
Locked-off static camera, no camera movement, no zoom, no pan. The hand and the finger stay perfectly still for the whole shot; only the brush and the ribbon move.
The fine nail-art brush makes one slow, precise, graceful stroke: as the bristle tip lifts slightly from the nail, a single thin ribbon of glossy rosé-gold satin lacquer flows out of the tip and unfurls smoothly through the air to the left, drawing one soft loop, until it rests exactly in the final position. The ribbon moves like silk in slow motion, with light travelling along its folds. Constant warm studio lighting, premium beauty commercial, elegant and calm.
No new objects, no text, no flicker, no morphing of the fingers, no change of the nail.
```
**Evitar:** `camera shake, zoom, hand movement, finger morphing, extra fingers, flicker, cuts, text, fast motion`

**Conferir**
- [ ] O primeiro quadro é a H1 e o último é a H2, sem salto no final.
- [ ] O dedo NÃO se mexe. Isso é importante: o título passa atrás do dedo no site, e o dedo recortado precisa ficar parado.
- [ ] A fita sai do pincel (não aparece do nada) e o movimento é lento e contínuo.
- [ ] Sem tremor, sem deformação, sem cortes.

---

## 2 · FITAS PARA AS TRANSIÇÕES (fundo preto puro)

**Como o site usa:** a fita é gerada sobre **preto puro** e o site apaga o preto com um modo de mesclagem de luz. Sobre as fotos fica só a fita brilhante, como no board. Ela aparece com uma revelação suave, uma vez, e mexe muito pouco com a rolagem. **Ela não se desenha mais pela página inteira.**
**Modelo:** Seedream 5.0 4K · **Referências de estilo:** `05-board-fitas-transicao.png` e `06-board-fita-estudio.png`

**Base comum** (cole no começo de cada prompt R1–R4):
```
Product photography of a single thin flat satin ribbon with a metallic rosé-gold sheen, glossy, with soft specular highlights along its folds and gentle twists, colours from light rosé #F0C8B4 through rosé #C29A8A to deep rosé #B9806C. Isolated on a pure solid black background (#000000), no floor, no surface, no shadow on the background, no reflections of the environment, no other objects, no text. Entire ribbon in sharp focus. The ribbon enters and leaves the frame through its edges, so neither end is visible.
```
**Evitar (todas):** `background texture, gradient background, smoke, sparkles, glitter dust, multiple colours, text, watermark, rope, wire, thick fabric, blurry`

**Conferir (todas)**
- [ ] Fundo **100% preto**, sem cinza, névoa ou brilho no fundo.
- [ ] A fita é fina e elegante, nunca um tecido largo.
- [ ] As duas pontas saem pelas bordas da imagem.

### R1 · `R1-fita-onda.png` — horizontal, borda entre as seções (desktop)
**Formato:** 21:9 (se não houver, 16:9) · **4K**
```
[BASE COMUM] Composition: the ribbon crosses the whole frame from the left edge to the right edge in one long, calm horizontal wave, slightly lower on the left and slightly higher on the right, with one soft twist in the middle third. The ribbon is about 1.5% of the image height thick.
```

### R2 · `R2-fita-diagonal.png` — diagonal, cena do estúdio (desktop)
**Formato:** 16:9 · **4K** · Igual ao board (`06-board-fita-estudio.png`)
```
[BASE COMUM] Composition: the ribbon enters at the top-right corner, sweeps down to the left in one long, elegant S-curve and leaves through the left edge near the bottom. The ribbon is about 1.2% of the image height thick, with a soft twist where it changes direction.
```

### R3 · `R3-fita-dupla.png` — dois fios paralelos, seção 02 (desktop)
**Formato:** 16:9 · **4K**
```
[BASE COMUM, but with two ribbons] Composition: two parallel thin satin ribbons, a few millimetres apart, flow together from the upper-left edge down to the lower-right edge in a long gentle curve, crossing over each other once near the middle like a loose twist. Each ribbon is about 0.8% of the image height thick.
```

### R4 · `R4-fita-vertical.png` — vertical, celular
**Formato:** 9:16 · **4K**
```
[BASE COMUM] Composition: the ribbon enters at the top edge slightly right of centre, flows down in one tall, relaxed S-curve and leaves through the left edge in the lower third. The ribbon is about 1.2% of the image width thick.
```

---

## 3 · ABERTURA NO CELULAR

### M1 · `M1-celular-inicio-4k.png` — a abertura vertical em 9:16
**Uso no site:** fundo da abertura no celular e primeiro quadro do vídeo.
**Referência:** `02-hero-celular.png` · **Modelo:** Nano Banana Pro (ou Seedream 5.0 4K com referência) · **Formato:** 9:16 · **4K** (2160×3840)
```
Extend this photograph to a 9:16 vertical frame without changing anything that is already there: the finger, the nude almond nail, the nail-art brush, the jar and the cloth keep their exact shape, size and lighting. Add more of the same soft, dark, blurred warm-brown background at the top (this empty dark area will hold a title) and a little more of the same dark textured cloth at the bottom. Premium beauty campaign, 4K detail. No text, no logo, no new objects.
```
**Conferir:** [ ] o dedo, a unha e o pincel iguais à referência · [ ] o terço de cima escuro e vazio

### M2 · `M2-celular-final-4k.png` — com a fita
**Referência:** `M1-celular-inicio-4k.png` + `04-board-fita-hero.png` (estilo) · **Formato:** 9:16 · **4K**
```
Edit this photograph and keep everything exactly as it is. Add one single thin satin ribbon of glossy rosé-gold lacquer (light rosé #F0C8B4 to deep rosé #B9806C, about 1% of the image width thick) that flows out of the very tip of the brush bristles, sweeps down-left below the nail, curves up along the left side of the frame in one soft S and leaves through the left edge in the upper third. It never covers the nail or the fingertip and never touches the top 10% of the image. Photorealistic, premium beauty campaign. No text, no logo.
```
**Conferir:** os mesmos itens da H2.

### V2 · `V2-hero-celular.mp4` — o gesto no celular
**Primeiro quadro:** `M1` · **Último quadro:** `M2` · **Formato:** 9:16 · 5 s · sem áudio · **use o mesmo prompt do V1.**
**Conferir:** os mesmos itens do V1.

---

## 4 · MACRO (seção 02 "Von der Idee zum Detail.")

### D1 · `D1-macro-4k.png` — a mesma macro, nítida
**Referência:** `03-macro.png` · **Modelo:** Nano Banana Pro · **Formato:** 16:9 · **4K**
```
Recreate this exact macro photograph at 4K resolution with no change to the composition: the same hand entering from the right, the same three nude almond nails with fine shimmer, the same rosé satin folds on the left, same light. Increase only clarity and fine detail (skin texture, shimmer particles, satin weave). No text, no logo, no added objects.
```
**Conferir:** [ ] composição idêntica, com as 3 unhas no mesmo lugar · [ ] a metade esquerda é só cetim (lugar do texto)

### D2 · `D2-macro-celular-4k.png` — macro vertical para o celular
**Referência:** `03-macro.png` (estilo e unhas) · **Modelo:** Seedream 5.0 4K ou Nano Banana Pro · **Formato:** 3:4 · **4K**
```
Vertical macro beauty photograph in the same style as the reference: a hand entering from the right edge resting on soft rosé satin, three nude almond nails with a fine shimmer, glossy, perfectly manicured, the same warm light. The nails sit in the lower half and on the right; the upper-left 45% of the frame is only smooth rosé satin folds, calm and empty (space for a title). Shallow depth of field, premium campaign, 4K detail. No text, no logo, no rings, no jewellery.
```
**Conferir:** [ ] unhas iguais às da referência (formato e cor) · [ ] o alto à esquerda vazio · [ ] anatomia perfeita

---

## 5 · OPCIONAL

### V3 · `V3-fita-loop.mp4` — fita viva em loop (fundo preto)
**Uso:** em vez da imagem R2 no estúdio, a fita ondula devagar sem parar.
**Primeiro e último quadro:** `R2-fita-diagonal.png` (o mesmo nos dois, para fechar o loop) · **Formato:** 16:9 · 8 s · sem áudio
```
Locked-off camera. The satin ribbon gently undulates in place, as if moved by a very soft breeze, slow and calm; light travels along its folds. The pure black background stays perfectly black. The ribbon returns exactly to its starting position at the end so the clip loops seamlessly. No new objects, no text.
```

---

## Quando terminar

Coloque tudo em `higgsfield/entregas/` e me avise. Do meu lado:

1. Confiro cada arquivo: se bate com a referência, se a anatomia está certa e se o preto é puro.
2. Refaço o recorte do dedo a partir da H1, para o título continuar atrás dele.
3. Converto os vídeos para web (MP4 + WebM, cerca de 1–2 MB) e as imagens para AVIF/WebP.
4. Monto tudo no branch `v2` e te mando o link de pré-visualização com capturas lado a lado com o board, **antes** de publicar.

**Enquanto isso** eu já faço a parte que não depende do Higgsfield: tiro o zoom, reenquadro as fotos na escala do board, removo a linha vetorial e acalmo as animações.

---

## O que foi gerado (25/10/2026, via conector Higgsfield)

O conector foi autorizado nesta sessão e as peças foram geradas direto daqui (~165 créditos). Arquivos em `higgsfield/entregas/` (fora do git e do deploy); `npm run prepare-higgsfield`, `npm run images` e `npm run film` levam o que foi escolhido para o site.

| Peça | Arquivo usado | Como foi feito | Observação |
| :-- | :-- | :-- | :-- |
| Abertura larga (início) | `H1w-hero-largo-v2.png` → `H1w-hero-largo-4k.png` | FLUX.2 Pro Outpaint (+402 px de cada lado, +120 px embaixo) + upscale 4K | Substitui a H1 16:9: o site agora mostra a cena na escala do board, sem zoom, e precisa de cena real além do recorte |
| Abertura larga (fim, com a fita) | `H2w-hero-final-4k.png` | GPT Image 2.5 (`H2w-hero-final-v3.png`), registrada por SIFT e só a fita transplantada sobre a H1 | Dedo, unha e pincel são pixel a pixel os da H1 |
| V1 · gesto (desktop) | `V1-hero-desktop.mp4` | MiniMax H3, 21:9, primeiro/último quadro fixos | Cinema Studio 3.0 descartado (reenquadrou a cena) |
| Celular início / fim | `M1-celular-inicio-4k.png`, `M2-celular-final-4k.png` | Outpaint 9:16 + upscale; fita do GPT Image 2.5 transplantada | |
| V2 · gesto (celular) | `V2-hero-celular.mp4` (= `-minimax`) | MiniMax H3, 9:16 | Kling 3.0 também ficou bom (`-kling`), reserva |
| Macro larga | `D1w-macro-larga.png` | Outpaint (+880 px de cetim à esquerda) | Ancorada na borda direita da página |
| Macro celular | `D2-macro-celular-4k.png` | Nano Banana 2.1, 3:4 | |
| Fitas | `R5-fita-fina-v3.png` (borda da macro), `R5-fita-fina.png` (borda de "Für dich."), `R2-fita-diagonal-v2.png` (estúdio) | Nano Banana 2.1 sobre preto, convertidas em PNG transparente | R1/R3/R4 ficaram grossas demais e não entram |
