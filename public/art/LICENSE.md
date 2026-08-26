# Arte de terceiros usada na Ascend

Todo o restante material gráfico da aplicação (avatar, fundos, ilustrações) é
original. Os ficheiros listados abaixo são a única exceção: foram criados por
outras pessoas e são usados ao abrigo da licença indicada.

## game-icons.net — Creative Commons BY 3.0

Origem: <https://game-icons.net> · Repositório: <https://github.com/game-icons/icons>
Licença: [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/)

Os ficheiros em `public/art/game-icons/` são os originais tal como publicados.
A versão usada em código (`src/data/artIcons.ts`) é a mesma arte com duas
alterações mecânicas: remoção do retângulo de fundo opaco e substituição da cor
fixa por `currentColor`, para que os ícones acompanhem o tema da aplicação.

### Por [Lorc](https://lorcblog.blogspot.com)

- `aura.svg`
- `burning-embers.svg`
- `cross-flare.svg`
- `energy-sword.svg`
- `feathered-wing.svg`
- `fire-silhouette.svg`
- `flame-spin.svg`
- `ghost.svg`
- `moon.svg`

### Por [Delapouite](https://delapouite.com)

- `katana.svg`
- `kimono.svg`
- `torii.svg` (original: `japanese-bridge`)

## Tipografia

- **Inter** — Rasmus Andersson, [SIL Open Font License 1.1](https://openfontlicense.org)
- **Rajdhani** — Indian Type Foundry, [SIL Open Font License 1.1](https://openfontlicense.org)

Ambas carregadas a partir do Google Fonts.

## Imagens do utilizador

A pasta `public/assets/` está reservada para imagens que **tu** escolheres
colocar (fundos, banner, avatar). Não vem nada lá dentro e o seu conteúdo está
no `.gitignore`, por isso essas imagens ficam apenas no teu dispositivo e nunca
são publicadas com o repositório. Ver o README para os nomes de ficheiro que a
aplicação procura.
