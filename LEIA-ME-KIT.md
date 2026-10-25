# Amanails Hamburg - Modelo 2 / Gesto

Direção escolhida pelo cliente em 25/10/2026: **modelo 2 inteiro**, incluindo hero e seções. Este kit substitui a direção anterior.

A cena começa no gesto do pincel. Um traço rosé acompanha o percurso, aproxima o detalhe, apresenta os trabalhos reais, desacelera no único intervalo blush e termina na foto original do estúdio.

## Abrir a demonstração
Sem instalação ou build. Na pasta `site/`, execute `python3 -m http.server 8080` e abra `http://localhost:8080`. Para encerrar, Ctrl+C. O servidor é apenas para uso local.

## O que está incluído
- `site/`: HTML, CSS, JavaScript, imagens otimizadas, máscaras vetoriais e fontes locais.
- `images-master/`: os três PNGs gerados para esta direção; sem texto gravado nas imagens.
- `originals/`: fotos reais preservadas e logo PNG com transparência.
- `docs/modelo-2-aprovado.png`: a referência visual exata escolhida.
- `docs/GUIA-VISUAL.pdf`: direção, estrutura, movimento e instruções de entrega.
- `references/`: conceitos, identidade e seis referências de estilo recebidas.
- `roteiros/`: execução do site, movimento e imagens.
- `animation/`: storyboard, parâmetros, vídeo animatic e script para reproduzi-lo.
- `tools/check_kit.py`: conferência estrutural e integridade dos arquivos.
- `MANIFEST.sha256`: hashes dos arquivos entregues.

## Estrutura aprovada
| Ordem | Cena | Fundo |
| --- | --- | --- |
| 1 | Eine Linie. Dein Stil. / pincel | Foto de campanha |
| 2 | Von der Idee zum Detail. / macro | Foto de campanha |
| 3 | Nägel mit Charakter. / DEIN. | Foto original de trabalho |
| 4 | Für dich. / serviços | **Única cor sólida: #BFA398** |
| 5 | Dein Moment bei Amanails. / contato e rodapé | Foto original do estúdio |

Não inserir o hero Portal, Relevo, Nude-Edition nem a seção adicional de craft da versão anterior. Não trocar a ordem do contraste e do portfólio. A referência aprovada é conceitual; o código usa as fotos documentais originais, sem reconstruir o salão.

## Interações
Navegação por âncoras, menu mobile, detalhes dos três serviços, modal com a foto inteira, pedido de contato via Instagram/telefone, botão de pausa e movimento reduzido. O pedido de horário é uma conversa com a empresa; não existe confirmação automática ou agenda conectada.

## Personalizar
Textos e destinos estão em `site/index.html`. As descrições dos serviços estão em `site/app.js`. Paleta e geometria visual estão em `site/styles.css`. O caminho da linha é vetorial e editável em `lineAt()` no JS. Não há dependências externas nem rastreamento.

## Verificar
Execute `python3 tools/check_kit.py` a partir da raiz do kit. Para JS: `node --check site/app.js`.
As fotos originais do site são idênticas aos arquivos recebidos. Imagens geradas são identificadas em “Bildhinweise”.

**Limite de validação:** a pré-visualização gerenciada não estava disponível. Foram conferidos código, estrutura, arquivos e documentos; layout/interações em navegador ainda precisam de revisão em desktop e celular. O MP4 é um animatic editado, não uma gravação do HTML. Nenhum site foi publicado.

Antes de publicação, inserir os dados legais fornecidos pela responsável pelo negócio. Não foram inventados nomes empresariais ou textos legais.

