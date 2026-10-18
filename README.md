# Gari do Rio — protótipo web

Projeto inicial de jogo 2D de plataforma inspirado no Rio de Janeiro.

## Estrutura
- `index.html`: tela e interface.
- `src/style.css`: layout, HUD e controles mobile.
- `src/game.js`: motor do jogo, movimento, colisões, coleta, pontuação e transições.
- `src/levels.js`: configuração das quatro fases.
- `assets/sprites/gari-sprite-sheet-conceito.png`: folha conceitual gerada para orientar o visual do protagonista e das animações.
- `assets/audio/`: pasta reservada para efeitos e música.

## Como executar
Abra `index.html` no navegador. Para desenvolvimento, também pode servir a pasta com qualquer servidor estático local.

## Controles
- Teclado: `←`/`→` ou `A`/`D` para andar; `Espaço`, `↑` ou `W` para pular.
- Celular: botões de esquerda, direita e pulo na tela.

## Fases incluídas
1. Praia de Copacabana
2. Centro do Rio
3. Comunidade
4. Zona Portuária

Todas estão implementadas como fases jogáveis no protótipo e compartilham o mesmo motor.

## Nota importante sobre os sprites
A folha em `assets/sprites/` é a arte conceitual de referência. O protagonista em jogo, nesta primeira versão, é desenhado pelo Canvas com formas vetoriais provisórias; a folha ainda não foi recortada em quadros transparentes e não está sendo usada como spritesheet de animação. O próximo refinamento recomendado é recortar/limpar os quadros e substituir o desenho provisório por animações consistentes, sem alterar o motor das fases.
