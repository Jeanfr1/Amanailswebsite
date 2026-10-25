# Roteiro da animação - Gesto
Movimento com sentido: o visitante acompanha o pincel, aproxima o detalhe e chega ao resultado real.

- Entrada: texto surge de baixo, em duas linhas, com atraso de 160 ms; duração de 1,1 s. Pequenos elementos entram por opacidade.
- Hero: faixa de rolagem de 165svh no desktop e 140svh no mobile; palco fotográfico de 100svh. Escala 1 a 1,11 no desktop; 1 a 1,065 no celular. Fundo e primeiro plano recebem exatamente a mesma transformação.
- Handoff: a cópia desaparece no trecho final de rolagem do hero. O contorno superior da macro entra sobre a foto anterior, seguindo o traço.
- Detalhe: parallax suave, até 3,4% em cada direção. Curva do traço muda de direção para conduzir o olhar à foto real.
- Portfólio: parallax de até 2%; a palavra DEIN. desloca apenas 1,2% em cada direção. A máscara de primeiro plano compartilha geometria com o fundo. Não deformar dedos.
- Serviços: pausa de leitura. A logo gira de +3 a -3 graus; linhas e botões ficam estáveis.
- Estúdio: foto original, movimento contido de até 2%, leitura do contato em primeiro plano e rodapé na mesma cena.
- Desenho da linha: caminho SVG normalizado com pathLength=1; avanço calculado pela rolagem; três traços sobrepostos criam espessura e brilho rosé discretos.

Nada de scroll hijacking, câmera 3D inventada, rotação artificial de mãos ou loop contínuo que consuma CPU parado. requestAnimationFrame só acompanha a rolagem e seu assentamento. Medir novamente após fontes, resize e imagens.

Botão de pausa: remove transformações, mantém todo o conteúdo visível e desenha a linha completa. Movimento reduzido do sistema tem prioridade e reduz o hero à altura da tela. Na retomada, recalcular a geometria.

