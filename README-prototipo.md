# Gari do Rio — protótipo web

Projeto de jogo 2D de plataforma inspirado no Rio de Janeiro.

## Estrutura
- `index.html`: tela e interface.
- `src/style.css`: layout, HUD e controles mobile.
- `src/game.js`: motor do jogo, movimento, colisões, coleta, pontuação e transições.
- `src/levels.js`: configuração das quatro fases.
- `assets/sprites/gari-sprite-sheet-conceito.png`: folha conceitual de referência visual do protagonista.

## Executar
Abra `index.html` no navegador ou publique a raiz no GitHub Pages.

## Controles
- Teclado: setas ou A/D para mover, Espaço/↑/W para pular.
- Celular: botões de toque na tela.

## Fases incluídas no protótipo
1. Praia de Copacabana
2. Centro do Rio
3. Comunidade
4. Zona Portuária

## Estado do sprite
A folha de referência está incluída nos assets, mas o personagem ainda é desenhado por Canvas no motor do jogo. Os quadros não foram recortados e integrados como animações individuais; isso é uma próxima etapa de refinamento.
