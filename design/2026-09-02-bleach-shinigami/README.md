# Handoff: Ascend — app de treino e nutrição (estética Bleach)

## Overview
Ascend é uma app móvel de treino + nutrição com uma camada de progressão de fantasia (patentes, reiatsu, kan, ordens diárias). Este pacote contém o protótipo interativo de alta fidelidade — **nove ecrãs** ligados — o design system que lhe corresponde, os tokens e duas gerações visuais anteriores como contexto.

**Fonte de verdade: `Ascend Bleach - Prototipo.dc.html`** (estética Bleach, 2 set 2026), com `tokens.css` e `Ascend Bleach - Design System.dc.html`. O `github.md` incluído tem o mapa ecrã↔ficheiro e as divergências protótipo↔`main`.

> **Revisão 2 (2 set 2026).** A revisão 1 corrigiu só a secção Rações e deixou o resto do README a descrever a geração laranja. Esta revisão reescreve o documento inteiro contra o protótipo Bleach: shell sem tab bar, nove ecrãs, ícones em sprite inline, estado atual, tokens atuais. Ver `CORRECOES.md`.

## About the Design Files
Os ficheiros deste bundle são **referências de design feitas em HTML** — protótipos que mostram o aspeto e o comportamento pretendidos, **não código de produção para copiar**. O trabalho é **recriar estes ecrãs no ambiente já existente do codebase** (React + Tailwind, no caso do `main`) usando os seus padrões e componentes.

Os protótipos correm num runtime próprio (`support.js`, template + classe de lógica). Ignorar esse runtime: interessa o markup inline-styled (valores exatos) e a lógica de estado descrita abaixo.

## Fidelity
**Alta fidelidade.** Cores, tipografia, espaçamentos, chanfros, glows e microinterações são finais.

A direção é **Bleach**: preto de shihakushō (`#0c0e13`) e carmim profundo, branco de osso na tinta (`#f2efe6`), laranja de reiatsu como cor do Sistema (`#ff8a14`), carmim em HP e destrutivo (`#c8102e`), ouro do Gotei na moeda (`#f0cf6e`), azul de kidō na confirmação (`#4fa3c7`). Saira Condensed + IBM Plex Mono + Barlow + Noto Sans JP. **Chanfros (`clip-path`) em vez de raios — não há um único `border-radius` no protótipo.** Grão, halftone e scanlines por baixo de tudo; brackets nos cantos das janelas; labels técnicos densos (`SYS//`, `ID_`, `ASC//03`, `LINK:`).

Contexto histórico, **não** referência:
- `Ascend Prototipo.dc.html` — geração laranja/carmim, cantos redondos (18–22 px), Rajdhani + Inter, tab bar de 5 colunas.
- `Ascend Redesign v5.dc.html` — **antecessor direto do Bleach**: também escuro (`#0a0a0e`), laranja `#ff7a1a`, Rajdhani. É desta geração que vem a maior parte da estrutura de conteúdo.
- `Ascend Redesign.dc.html` — exploração em tema claro de papel (`#c9c1b2`, carmim `#b3231a`, IBM Plex + Zen Old Mincho).

## Idioma
Toda a UI está em **português de Portugal**. A copy exata está nos ficheiros; manter verbatim. As Definições oferecem `PORTUGUÊS` / `ENGLISH (UK)`.

## Device frame
402 × 874 pt (iPhone 16 Pro). Não há tab bar nem safe area inferior reservada: o HUD ocupa `top:58px` e cada janela vive entre `top:156px` e `bottom:30px`, com `left/right:12px`. A faixa de 30 px em baixo é onde ficam a fita de perigo dourada (6 px), a linha de estado em mono (`ASC // 昇天 // 0x1F` … `PT-PT · 60Hz`) e a marca de registo no canto.

---

## Shell — HUD + janelas (substitui a tab bar)

**Não há barra de separadores.** O HUD é a única peça fixa; tocar nele abre o `[ MENU ]`; cada módulo materializa-se como janela sobre a `[ QUEST ]`.

### Ambiente (dentro do ecrã, por baixo de tudo)
Quatro camadas fixas, todas `pointer-events:none`, sobre `#0c0e13`:
1. Gradientes: `radial-gradient(26rem 20rem at 88% -8%, rgba(200,16,46,.3))` · `radial-gradient(20rem 20rem at 4% 100%, rgba(122,16,36,.35))` · `radial-gradient(16rem 14rem at 96% 82%, rgba(79,163,199,.1))` · `radial-gradient(30rem 22rem at 50% 28%, rgba(255,138,20,.1))` + grelha `repeating-linear-gradient(90deg, rgba(79,163,199,.05) 0 1px, transparent 1px 9px, rgba(200,16,46,.04) 9px 10px, transparent 10px 23px)` e scanline horizontal de 44 px.
2. Halftone: pontos `rgba(200,16,46,.1)` 1 px em grelha de 7 px, `opacity:.55`.
3. Grão: SVG `feTurbulence` (baseFrequency .85, 2 oitavas), `opacity:.35`, `mix-blend-mode:overlay`.
4. **Chuva de reiatsu:** linhas verticais (kidō, carmim, laranja) com máscara em gradiente de 320 px a descer, `animation:srain 7s linear infinite`.
Mais dois anéis chanfrados concêntricos (520 px `rgba(255,138,20,.07)`, 380 px tracejado `rgba(255,138,20,.1)`) centrados a 52 % da altura.

### HUD (`top:58px`, z-index 30)
Botão único de 56 px, chanfro 10 px, `border:1px solid rgba(255,138,20,.35)`, `background:rgba(21,23,31,.82)` com `backdrop-filter:blur(12px)`:
- Selo hexagonal 36 px `#ff8a14` com miolo `#15171f` e inicial Saira 13/700.
- `ID_` (mono 9, `#6e6a62`) · nome Saira 15/700 `.14em` maiúsculas · `LV 07` mono 11 `#ffcb95` · hexágono 16 px com o rank (`E · D · C · B · A · S`).
- Barra de reiatsu 6 px: trilho `#1e212b`, fill `#ff8a14` com `box-shadow:0 0 10px rgba(255,138,20,.7)`, por cima máscara de segmentos de 10 % em `#0c0e13`.
- À direita, mono 12/700: dias de serviço (`ic-fire`, `#d9a635`) e kan (`ic-kan`, `#f0cf6e`).
- Hover: `shover` (varrimento de kidō a atravessar) + borda `#ff8a14`; active: `translateY(1px)` e borda `#4fa3c7`.

Abaixo: fita de perigo de 2 px (`repeating-linear-gradient(-45deg, rgba(240,207,110,.75) 0 6px, transparent 6px 12px)`) e a linha de estado em mono 9 px — `>` laranja, caminho (`asc / dojo / sessão`), régua tracejada, `LINK:` com quatro barras de kidō (a última em `sbreath`), relógio (`mm:ss` em sessão, `--:--` fora).

### Janela (padrão de todos os módulos)
`position:absolute; top:156px; left:12px; right:12px; bottom:30px`, moldura por `padding:1px` sobre `background:rgba(255,138,20,.5)` e chanfro de 14 px; interior `rgba(21,23,31,.86–.92)` + `backdrop-filter:blur(14px)`; trama (scanline 1/3 px `rgba(255,138,20,.05)` + halftone carmim 7 px).

Entrada, sempre a mesma: `smat` 220 ms (materializar de fora para dentro) + `sscan` 340 ms (linha de boot a descer) + `swipe` 260 ms (wipe diagonal laranja/carmim) + brackets de 2 px no canto superior direito (`#ff8a14`) e inferior esquerdo (`rgba(255,138,20,.45)`).

Cabeçalho: `padding:14px 8px 12px 18px`, `border-bottom:1px solid rgba(255,138,20,.18)`, `background:linear-gradient(180deg, rgba(255,138,20,.08), transparent)`. À esquerda o título entre brackets — `[ QUEST ]`, `[ MENU ]`, `[ DOJO ]`, `[ SESSION ]`, `[ RATIONS ]`, `[ ORDERS ]`, `[ STATUS ]`, `[ CONFIG ]` — Saira 13/700 `.22em` `#ff8a14` com ícone de 15 px e glitch `sfix` de 140 ms. À direita: kana (`クエスト`, `道場`, `配給`, `命令`, `状態`, `設定`), código `ASC//01…06` e `×` de 44 px que volta à QUEST.

Corpo: `flex:1; overflow-y:auto; padding:16px 18px 22px`.

### QUEST como base
A `[ QUEST ]` está sempre montada e não tem `×`. Quando outra janela ou o menu abrem, recua: `opacity:.45`, `transform:scale(.96) translateY(-10px)`, `pointer-events:none`.

### `[ MENU ]`
Grelha 2 × 3, tiles de 76 px, chamfer 8 px: ícone 22 px com `drop-shadow`, código (`QUEST`, `DOJO`, `RATIONS`, `ORDERS`, `STATUS`, `CONFIG`), `ASC//0n` em mono, nome em português e kana. Ativo: borda `#ff8a14`, `background:rgba(255,138,20,.12)`, `box-shadow:inset 4px 0 0 #ff8a14, 0 0 18px rgba(255,138,20,.28)`. Fundo clicável fecha; `×` de 44 px no cabeçalho.

### Toast de sistema
`bottom:44px`, chanfro 10 px, moldura da cor do evento, ícone em `sbreath`, código + texto, `×` de 32 px e barra de 2 px a esvaziar (`sdrain` 3400 ms). Usos no protótipo: `SYS//LOG 0x2A` em kidō (`+250 ml em hidratação`) e `SYS//ERR 0x11` em carmim (`registo removido do diário`).

### Modal de sistema
Centrado, chanfro 12 px, moldura `rgba(255,138,20,.55)` (ou `rgba(200,16,46,.6)` no destrutivo), título Saira 11/700 `.24em`, escudo hexagonal SVG de 40 px com `drop-shadow`, texto 13/1.6. Uma via: `CONFIRMAR` (laranja, 48 px). Duas vias no destrutivo: `CANCELAR` (contorno) + `APAGAR` (`#c8102e`). O modal é o veículo de tudo o que o protótipo não simula (câmara, texto, criador de treinos, plano com IA, pesagem).

---

## Screens / Views

### 1. Quartel — `[ QUEST ]` · `data-screen-label="Quartel"` · ASC//01
Terminal de campo: a ordem do dia e os dois sinais vitais. Kanji vertical 肉体強化 (Noto Sans JP 900, 56 px, `rgba(242,239,230,.05)`) no bordo direito.

- **Arte de topo** 132 px, full-bleed (`margin:0 -18px 14px`): `image-slot` `id="quest-hero"`, véu `linear-gradient(180deg, rgba(21,23,31,.1), rgba(21,23,31,.92))` + scanlines, etiqueta neon 昇天強化 (`#ef4a63` sobre `rgba(200,16,46,.18)`, `animation:sneon 5s`), e o logótipo 昇天 30 px com `A S C E N D` em Saira 8.5/700 `letter-spacing:.6em`.
- Eyebrow `SYS// ORDEM DO DIA · TER` (Saira 10.5/700 `.18em` `#ffcb95`) · título `Inferior A` Saira 36/700 com `text-shadow:2px 2px 0 rgba(200,16,46,.45), -2px -1px 0 rgba(255,138,20,.45)` · linha mono `QUADRÍCEPS · GLÚTEOS` + régua tracejada + `TER 19:30`.
- **Quatro células** (grid 4 × 1, gap 3, chamfer 5): `06 EXERC` · `18 SÉRIES` · `48′ TEMPO` · `90″ DESC` — número mono 15/700, rótulo Saira 8.5/700 `.14em` `#6e6a62`.
- **Chips**: `RTS_+198` (laranja), `KAN_+47` (ouro), `ASC//02` (kidō, `margin-left:auto`) — altura 24, `border-left:2px`, chanfro 5.
- **CTA** 52 px `#ff8a14`, texto `#0c0e13` Saira 14/700 `.14em`, chanfro 8, `animation:spulse 2.4s`. Label: `INICIAR SESSÃO` → `CONTINUAR SESSÃO` (sessão a decorrer) → `TREINAR OUTRA VEZ` (treino do dia já feito). Hover: `translate(-1px,-1px)` + `0 0 0 1px #f2efe6, 5px 5px 0 rgba(200,16,46,.35)`; active: `#4fa3c7`.
- **Resumo `[ RATIONS ]`** (botão, `border-top:1px solid #2b2f3b`): eyebrow + `ASC//03` + `faltam 1 174 ▸`; kcal mono 28/700 + `/ 2 680 kcal`; barra 6 px carmim `#c8102e` com máscara de 10 %; duas colunas `PROT` e `H2O` com barras de 4 px (`#ff8a14` / `#ffcb95`).
- **Resumo `[ ORDERS ]`** (botão): eyebrow + `ASC//04` + `0 / 3 ▸`; três linhas de 30 px (grid `24px 14px 1fr 34px auto`): `ORD01`, caixa de 14 px, nome em Saira maiúsculas, barra de 4 px e prémio (`+25` / `CUMPRIDA`).
- Rodapé mono: `Oficial de Divisão · SECÇÃO 9` / `LINK: estável`.

### 2. Menu — `[ MENU ]` · `data-screen-label="Menu"`
Ver «Shell». É um ecrã por direito próprio: é a navegação inteira da app.

### 3. Dojo — `[ DOJO ]` · `data-screen-label="Dojo"` · ASC//02
Briefing de missão.
- **Semana**: 7 células de 52 px (grid 7 × 1, gap 4) — dia em Saira 10/700 e marca de 16 px (`✓` feito, vazio marcado, `·` livre). Hoje: borda `#ff8a14`, fundo `rgba(255,138,20,.12)`.
- `PLANO// HOJE · INFERIOR A` + `Quadríceps e glúteos` (Saira 24/700) + linha mono `0 / 18 séries · 24:18`.
- CTA 52 px igual à do Quartel (`INICIAR SESSÃO` / `CONTINUAR SESSÃO`).
- **Lista de exercícios** (6): cartões `border:1px solid #2b2f3b`, linha de 56 px em grid `24px 1fr auto auto` — ícone 20 px `#ffcb95`, nome 13/600, meta `Pernas · Halteres · 90 s` 10.5 `#a9a49a`, séries `4×10` em mono 13/700 `#ffcb95`, estado à direita (`✓` laranja, `2/4` `#ffcb95`, seta `▸`/`▾`). Aberto: descrição 12/1.6 com `border-top`.
- **Dois botões de 44 px**: `PLANO COM IA` (borda `rgba(255,138,20,.45)`, fundo `rgba(255,138,20,.08)`) e `CRIAR TREINO` (borda `#2b2f3b`, transparente). Ambos abrem o modal de sistema — alinhado com o `main`, que tem os dois.
- `LOG// 4 de 12 sessões` + quatro linhas de 44 px: nome, `25 ago · 16/16 séries · 44 min`, `+166 RTS`.

### 4. Treino — `[ SESSION ]` · `data-screen-label="Treino"`
Modo tático. Cabeçalho com cronómetro mono 13/700 + botão de pausa (`❚❚` / `▶`) + `×`; em pausa cronómetro e botão passam a `#d9a635`. Barra de progresso de 3 px logo abaixo do cabeçalho (fill `#ff8a14` com glow) — é a única leitura de progresso.

- Linha `EX 01 / 06` (Saira 10/700) + `PERNAS · SEM EQUIPAMENTO` à direita.
- Kanji do grupo (脚 pernas, 芯 core) 72 px `rgba(242,239,230,.05)` atrás do título; nome do exercício Saira 32/700 com duplo `text-shadow`.
- Reps em mono 40/700 `#ffcb95` + `série 1 / 4` + botão `VER DEMO` / `FECHAR DEMO` (32 px, contorno).
- Descrição 12.5/1.6 `#a9a49a`.
- **Demonstração**: painel 16/9, borda `rgba(255,138,20,.35)`, duas fotografias de `exercises/` sobrepostas com `animation:sdemo 2.4s` e `filter:saturate(.3) contrast(1.1)`, scanlines por cima, etiqueta `REC · DEMO` em mono 9 `#ff8a14`.
- **Séries**: grid de N colunas, células de 52 px — número mono 15/700 e estado Saira 8.5/700 (`SÉRIE` → `FEITA`). Feita: fundo `#ff8a14`, tinta `#0c0e13`.
- **Descanso**: painel dourado (`border:1px solid rgba(217,166,53,.55)`, fundo `rgba(217,166,53,.07)`) com `DESCANSO`, `mm:ss` em mono 22/700, barra de 6 px segmentada e `SALTAR ▸`. **Enquanto o descanso corre, a moldura da janela passa de laranja a `rgba(217,166,53,.6)`** — o laranja é o Sistema, o ouro é a espera.
- **Rodapé fixo** (`border-top` + fita dourada de 3 px): pontos dos exercícios (5 px de altura, 22 px de largura no atual, `#ff8a14` quando completo) que saltam para o exercício, `▸ Agachamento goblet`, CTA de 52 px (`SÉRIE 2 FEITA` → `PRÓXIMO EXERCÍCIO` → `CONCLUIR SESSÃO`) e, quando há séries feitas mas a sessão está incompleta, `TERMINAR AQUI · 7 / 18 SÉRIES` (40 px, texto).

### 5. Rações — `[ RATIONS ]` · `data-screen-label="Rações"` · ASC//03
Três separadores de 44 px no topo do corpo: **ESTADO · DIÁRIO · REGISTAR** (ativo: borda `#ff8a14`, fundo `rgba(255,138,20,.14)`). Kanji 糧 88 px `rgba(242,239,230,.045)` no canto superior direito.

**ESTADO** — grid `150px 1fr`:
- Anel de 150 px: `circle r=64` de trilho `#1e212b` (10 px), máscara de segmentos (`stroke-dasharray:2 38.2` em `#0c0e13`, 12 px), progresso `#c8102e` com `drop-shadow(0 0 6px rgba(200,16,46,.8))` e `stroke-dasharray` calculada (`kcalDash = min(1, kcal/meta) × 2π × 64`), círculo interior tracejado r=54. No centro: `FALTAM` / `A MAIS` (Saira 9.5/700 `.2em`), número mono 30/700 com glow carmim, `1 506 / 2 680` em mono 9.5. Selo `OK` laranja aparece sob o anel quando a proteína fecha.
- Três macros (PROTEÍNA `#ff8a14`, HIDRATOS `rgba(255,138,20,.55)`, GORDURA `#d9a635`): rótulo Saira 10.5/700 `.16em` + `valor/meta g` em mono, barra de 6 px segmentada a 10 %.
- Aviso `▲ META ULTRAPASSADA` (mono 10.5 dourado) quando as kcal passam a meta em mais de 5 %.
- **Hidratação** (`border-top`): losango de 40 px que enche de `#5cc8ff` conforme a percentagem, `1,3 / 2,5 L` em mono 12/700, dez células de 6 px cortadas em diagonal, e dois botões de 44 px `+250` / `+500` em kidō.
- **SUGESTÃO**: quando faltam mais de 20 g de proteína, título `−48 g` e duas linhas de alimento (nome, kcal, `P 47 g`); abaixo disso, `Metas quase fechadas` com ícone.

**DIÁRIO** — `×7` (contagem de entradas) e quatro cartões de refeição: `P.ALMOÇO` / `ALMOÇO` / `LANCHE` / `JANTAR` com ícone de fase do dia (`ic-manha`, `ic-meio`, `ic-tarde`, `ic-noite`) em `#ff8a14`, total em mono, `+` de 44 px (leva ao REGISTAR já com a refeição escolhida) e as entradas em linhas de 44 px (nome, gramas, kcal em mono 13/700, `×` que remove e dispara o toast). Refeição vazia mostra `—`.

**REGISTAR** — duas portas de entrada tracejadas de 64 px, `FOTO` e `TEXTO` (`border:1px dashed rgba(255,138,20,.5)`), ambas a abrir o modal de sistema com o comportamento no produto (foto: estimativa de kcal e macros para confirmar, miniatura anexada; texto: descrição livre, «arroz, frango e salada»). Alinhado com o `main` — PR #4 tirou o pill «Foto · código», PR #5 acrescentou o registo por texto. Depois: `RÁPIDO` — quatro chips de destino de 44 px e oito alimentos do catálogo em linhas de 48 px com `+`.

### 6. Ordens — `[ ORDERS ]` · `data-screen-label="Ordens"` · ASC//04
Kanji 令 88 px. `ORD// DIÁRIAS · 0 / 3` + `reset 00:00`, e a regra em texto: «Uma ordem cumpre-se ao fazer a coisa. Tocar leva ao sítio onde se cumpre; o prémio entra sozinho.»
- **Três ordens diárias** como botões de 12/14 px de padding: ícone 20 px, título 13/600, progresso em mono 10.5 (`1 250 / 2 500 ml`, `110 / 120 g proteína`, `ainda sem sessão hoje`), prémio em duas linhas (`+25` / `+6k`) e barra de 4 px. Em progresso: `inset 3px 0 0 #ff8a14`. **Cumprida: inverte — fundo `#ff8a14` sólido, tinta `#0c0e13`, barra `#0c0e13`, prémio `CUMPRIDA`, `box-shadow:0 0 16px rgba(255,138,20,.35)`.**
- **`ORD// SEMANAIS · ORDEM DO CAPITÃO`**: três cartões (`Três treinos esta semana` `+150 · +40k`; `Semana de ferro` `+220 · +60k`; `Rio de reiatsu · 15 L de água` `+120 · +30k`) com barra de 6 px segmentada pelo número de passos (3, 4 e 10) e progresso em mono.
- Rodapé mono: `5 dias de serviço · melhor marca 12 d · licença guardada`.

### 7. Ficha — `[ STATUS ]` · `data-screen-label="Ficha"` · ASC//05
Três faces em separadores de 40 px: **PROGRESSO · CONQUISTAS · ARSENAL**.

**PROGRESSO**
- Retrato hexagonal 96 × 108 (`clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)`), moldura `#ff8a14` com `box-shadow:0 0 14px rgba(255,138,20,.5)`, miolo `#15171f` com `image-slot id="status-retrato"`, e hexágono de 28 px com o rank no canto inferior direito. Ao lado: `PATENTE 07 · DÉCIMA PRIMEIRA DIVISÃO`, nome da patente Saira 17/700, `561 / 1 852 RTS` em mono.
- **Seis números** (grid 3 × 2, células de 10 px): Treinos 12 · Ordens 34 · Refeições 80 · Dias de serviço 5d (`#d9a635`) · Melhor marca 12d (`#f0cf6e`) · Tempo total 516m — valor mono 18/700 com ícone de 14 px, rótulo Saira 8.5/700.
- `ART// ARTES`: quatro barras `/20` com máscara de 5 % — Zanjutsu 14, Hohō 9, Kidō 11, Reiryoku 8.
- `RTS// 7 DIAS` + `504 RTS · 3 sessões`: gráfico de 7 colunas, 60 px de altura, barras `#ff8a14` com glow (mínimo 3 px nos dias vazios) e dia em mono 9.
- `BIO// CORPO` + `última a 9 ago`: peso mono 30/700 (`74,0 kg`), `−0,8 kg em 5 semanas`, sparkline de 6 barras (40 px) e histórico de 4 linhas (`9 ago` / `74,0 kg · 81,2 cm`). Botão `REGISTAR PESAGEM` de 44 px (modal).

**CONQUISTAS** — `ARQ// 8 / 10` + `selos do Gotei`; grelha 2 × 5 de cartões de 76 px: SVG de 26 px de `art/c/`, nome 12/600, progresso em mono (`DESBLOQUEADA` ou `0 / 1`). Ganha: `-spirit`, borda `rgba(255,138,20,.45)`, fundo `rgba(255,138,20,.06)`; bloqueada: `-faint`, `opacity:.5`. Ordem e emblemas iguais a `data/achievements.ts`. No estado da demonstração faltam duas: **Máscara de Hollow** (patente 10) e **Forja da Asauchi** (criar um treino).

**ARSENAL** — `INV// ARSENAL` + kan em ouro; regra em texto: «Kan só compra estética, nunca vantagem.» Três grupos (`SELOS`, `TÍTULOS`, `REIATSU`) com linhas de 56 px: amostra hexagonal de 28 px, nome 12.5/600, etiqueta de escalão (`HOLLOW` `#a9a49a`, `ADJUCHAS` `#ffcb95`, `VASTO LORDE` `#f0cf6e`), descrição 10.5 e, à direita, preço em kan ou `EQUIPADO` em laranja.

### 8. Definições — `[ CONFIG ]` · `data-screen-label="Definições"` · ASC//06
- `SYS// PARÂMETROS`: quatro linhas de 56 px (grid `20px 1fr auto`) — Idioma da aplicação `PT`, Dados do perfil `GANHAR MASSA`, Divisão `DÉCIMA PRIMEIRA`, Reconhecimento por fotografia `OFF`. Tocar expande **em linha** um painel laranja com título, nota e chips de 40 px (idioma: 2 opções; objetivo: 4; divisão: as 13; visão: Gemini / OpenRouter / Groq / OpenAI). Abaixo, `METAS · 2 680 kcal · 158 g prot · 275 g hid · 74 g gord · 2 500 ml` em mono 9.5.
- `ID_ AVATAR`: `FIGURA` / `BRASÃO`, oito penteados (44 px, numerados) e oito matizes de reiatsu (losango de 20 × 22 px, `hsl(h 90% 60%)` para h = 200, 180, 220, 268, 320, 0, 24, 48).
- `IMG// FUNDO`: `PREDEFINIDO` / `A MINHA IMAGEM`, dois slots tracejados de 84 px (`Fundo · 5 ecrãs` e `Retrato` — os mesmos ids do Quartel e da Ficha) e `VÉU DE CONTRASTE` `0,78` com barra segmentada.
- `REPOR DADOS DO DISPOSITIVO` (44 px, `border:1px solid rgba(200,16,46,.55)`, texto `#e8697d`) — **a única ação vermelha da app**, com modal de dois botões.
- Rodapé mono centrado: `ASCEND · build 1.0 (2) · PROJETO ASC-01 · TestFlight`.

### 9. Celebração — `data-screen-label="Celebração"`
Ecrã inteiro (`z-index:60`, `#0c0e13`), sem HUD nem janela. Radial laranja `rgba(255,138,20,.22)` + scanlines; dois hexágonos concêntricos (300 px `rgba(255,138,20,.25)` em `spulse`, 420 px tracejado); 昇天 120 px `rgba(242,239,230,.045)` atrás do bloco.
`[ SYS // SINCRONIA ]` (Saira 11/700 `.28em`) · etiqueta `SESSÃO CONCLUÍDA` ou `SUBIDA DE PATENTE` · hexágono de 96 × 108 com o rank em Saira 44/700 e `drop-shadow(0 0 22px)` · `PATENTE 07` em mono · nome da patente Saira 26/700 · frase (30ch) · `18 / 18 séries · 24:18` · três células `REIATSU` / `KAN` / `ARTES` (mono 22/700; artes `+2`, ou `+3` na sessão completa) · `sessão completa · +1 kidō` quando 100 % · CTA `CONFIRMAR` de 52 px.

---

## Interactions & Behavior
- **Navegação:** HUD → `[ MENU ]` → módulo. O `×` de qualquer janela volta à QUEST. No Quartel, o resumo de Rações e o de Ordens são botões que abrem o módulo respetivo; a CTA abre a sessão diretamente. Tocar numa ordem abre o módulo onde ela se cumpre (hidratação e proteína → Rações, treino → Dojo).
- **Ordens:** sem marcação manual. Hidratação fecha aos 2 500 ml, proteína aos 120 g, treino ao concluir a sessão (que também paga o prémio, uma só vez por dia). O prémio entra em xp e kan no momento em que o alvo é atingido.
- **Séries:** tocar alterna. Ao marcar, arranca o descanso do exercício (45–90 s); se todas as séries do exercício ficarem feitas, avança para o seguinte. A CTA do rodapé faz o mesmo pela ordem natural (marcar a próxima série → avançar exercício → concluir).
- **Timer global de 1 s:** incrementa `decorrido` só em sessão e sem pausa; decrementa `descanso` até `null`, também parado em pausa.
- **Concluir sessão:** calcula recompensa, marca a ordem «treino», incrementa artes (zanjutsu +1, hohō +1, kidō +1 só se 100 %), abre a Celebração; se a patente subiu, variante `SUBIDA DE PATENTE`. Terminar a meio dá recompensa proporcional, sem penalização. Fechar a celebração reinicia séries, exercício e cronómetro.
- **Toast** (3,4 s) para o que acontece; **modal** para o que o protótipo não simula. Nunca os dois ao mesmo tempo.
- **Animações** (todas ≤ 340 ms exceto as de respiração): `smat` 220 ms materializar · `sscan` 340 ms boot · `swipe` 260 ms wipe diagonal · `sfix` 140 ms glitch de título (`steps(2)`) · `shover` 300 ms varrimento de hover · `spulse` 2,4 s glow do CTA · `sblink` 1,6 s ponto de estado · `sbreath` 2 s · `sdemo` 2,4 s troca de fotografias · `srain` 7 s chuva de reiatsu · `sneon` 5 s (`steps(1)`) etiqueta neon · `sdrain` 3,4 s barra do toast · `sfade` 200 ms. `prefers-reduced-motion` desliga tudo.
- Alvos ≥ 44 px, `:focus-visible` com contorno laranja de 2 px, `-webkit-tap-highlight-color:transparent`. No target nativo usar press state a ~92 % de opacidade.

## State Management
```
tela: 'quartel' | 'dojo' | 'racoes' | 'ordens' | 'ficha' | 'config' | 'celeb'
menu: bool                       // grelha de subsistemas por cima da QUEST
modal: { titulo, texto, destrutivo } | null
toast: { codigo, texto, cor } | null      // auto-fecha a 3400 ms
xp, kan, dias, melhor, licenca, treinos, treinosSemana, ordensCumpridas
artes: { zanjutsu, hoho, kido, reiryoku }
ordens: { hidratacao: bool, treino: bool, proteina: bool }
diario: [{ k, ref (índice da refeição), id (alimento), g }]
agua (ml), seq (contador de chaves), refRapida (refeição de destino)
abaRacoes: 'estado' | 'diario' | 'registar'
face: 'progresso' | 'conquistas' | 'arsenal'
dojoVista: 'plano' | 'sessao'; expandido (id do exercício); emSessao; pausado; verDemo
marcadas: bool[][] (exercício × série); exercicio; decorrido (s); descanso; descansoTotal
painel: 'idioma' | 'perfil' | 'divisao' | 'visao' | null
idioma, divisao, fundo, penteado, matiz, brasao
celeb: { xp, kan, feitas, total, segundos, subiu, nivel, cosmetico } | null
```
Sem fetch: tudo local. Numa app real, o que persiste é `diario`, `agua`, `marcadas`, `xp`/`kan` e as preferências das Definições.

**Fórmulas (implementar exatamente):**
```js
xpDoNivel(n)   = round(100 * n ** 1.5)
xpTotalAte(n)  = soma de xpDoNivel(1..n-1)
nivelDeXp(xp)  = maior n com xp >= xpTotalAte(n) → { nivel, atual, proximo }
recompensaSessao(feitas, total, segundos):
  taxa = feitas / total
  xp  = round(40 + feitas*6 + (taxa >= 1 ? 30 : 0) + min(20, floor(segundos/60)))
  kan = round(10 + feitas*1.5 + (taxa >= 1 ? 10 : 0))
rankDe(n) = n>=14 'S' · n>=10 'A' · n>=7 'B' · n>=5 'C' · n>=3 'D' · 'E'
```
Patentes por nível: 1 Alma de Rukongai · 3 Aluno da Academia Shinʼō · 5 Shinigami sem Patente · 7 Oficial de Divisão · 10 Terceiro Oficial · 14 Tenente · 18 Capitão · 25 Capitão-Comandante.

Metas no protótipo (`METAS`): kcal 2 680 · proteína 158 g · hidratos 275 g · gordura 74 g · água 2 500 ml (`AGUA_META`).

> **Divergência aberta — o código manda.** `computeTargets(DEMO_PROFILE)` no `main` devolve 2 800 / 133 / 392 / 78 (BMR 1 737,5 × 1,465 × 1,10). O protótipo tem números fixos de maquete, e a ordem diária de proteína usa 120 g — que é 133 × 0,9, ou seja derivada do valor do código. **Na implementação usar sempre `computeTargets`.**

Estado da demonstração (`data/demoUser.ts`): Kai, Décima Primeira Divisão, patente 7 (`xp = xpTotalAte(7) + 0,42 × xpDoNivel(7)`), 320 kan, 5 dias de serviço (melhor 12), licença guardada, 12 treinos (2 nesta semana), 34 ordens cumpridas, 1 250 ml de água, pequeno-almoço e almoço registados (7 entradas), `decorrido` a 1 458 s.
Ordens diárias: hidratação (2 500 ml) +25 xp / +6 kan; treino do dia +40 / +10; proteína (120 g) +35 / +10.
Constantes no fim do protótipo — copiar tal e qual: `PLANO`, `SEMANA`, `REFEICOES`, `ALIMENTOS`, `RAPIDOS`, `ORDENS_BASE`, `PATENTES`, `CONQUISTAS`, `COSMETICOS`, `DIVISOES`, `PESAGENS`, `REIATSU_SEMANA`, `HISTORICO`.

## Design Tokens
Ver `tokens.css` (formato `@theme` do Tailwind v4) — é a fonte central. Resumo:

**Cores**
```
Vazio (fundo)    #0c0e13     Painel        #15171f     Trilho     #1e212b
Linha            #2b2f3b     Carmim fundo  #7a1024 (só em rgba, nos gradientes)
Tinta            #f2efe6     Tinta suave   #a9a49a     Tinta fraca #6e6a62
Reiatsu (link)   #ff8a14     Reiatsu claro #ffcb95
Sinal (HP)       #c8102e     Carmim claro  #ef4a63     Carmim texto #e8697d
Alerta (ouro)    #d9a635     Kan           #f0cf6e
Kidō             #4fa3c7     Hidratação    #5cc8ff     Kidō claro   #8fd0e8
Superfícies de janela: rgba(21,23,31,.82 / .86 / .90 / .92 / .94) + blur 12–14 px
Molduras: rgba(255,138,20,.5) (janela) · .6 (menu) · rgba(217,166,53,.6) (descanso)
```
Sem gradientes de marca: o laranja é chapado. Gradientes só no ambiente (radiais) e nas amostras do Arsenal.

**Tipografia**
- Saira Condensed 500/600/700 — títulos, rótulos, CTAs, eyebrows (`letter-spacing` .1–.28em, maiúsculas).
- IBM Plex Mono 400–700 — todos os números, códigos, progressos, caminhos.
- Barlow 400–700 — corpo e listas.
- Noto Sans JP 700/900 — kanji e kana decorativos.
- Escala: 8.5, 9, 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 13.5, 14, 15, 17, 18, 22, 24, 26, 28, 30, 32, 36, 40, 44, 56, 64, 72, 88, 120.
- `font-variant-numeric:tabular-nums` global.

**Forma** — chanfro via `clip-path:polygon(Npx 0,100% 0,100% calc(100% - Npx),calc(100% - Npx) 100%,0 100%,0 Npx)` com N = 5, 8, 10, 12, 14, 16. Hexágonos (selos, patente, amostras): `polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%)`. Traço 1 px; brackets 2 px. **Nenhum `border-radius`.**

**Espaço** — 2, 3, 4, 5, 6, 7, 8, 10, 12, 14, 16, 18, 22, 24 (padding lateral das janelas: 18).

**Glow** — `0 0 14px rgba(255,138,20,.55)` · `0 0 8–12px` nas barras e pontos · `drop-shadow(0 0 6–22px)` nos hexágonos e no anel de kcal. Sempre curto, nunca difuso.

## Assets
**O sistema de ícones mudou.** O protótipo Bleach usa um **sprite SVG inline de 30 símbolos** (`<symbol id="ic-*">`, viewBox 24, `stroke-width:1.5`, `stroke:currentColor`, sem fill): `quest, menu, dojo, sessao, racoes, ordens, status, config, timer, water, fire, kan, bolt, scale, prot, hid, gord, lista, lang, user, eye, image, trash, camera, text, arsenal, manha, meio, tarde, noite`. Recriar como componente de ícone com o traço a herdar a cor.

Os únicos ficheiros de `art/` ainda em uso são os **20 emblemas das conquistas** (26 px): `art/c/{quick-slash, spark-spirit, shinto-shrine, crossed-swords, soul-vessel, hollow-mask, hell-butterfly, kimono, sword-hilt, third-eye}-{spirit, faint}.svg`. O resto de `art/` e `art/c/` (134 SVGs, base game-icons, recolorados por tom) vem da geração laranja e fica como contexto.

`exercises/` — 12 fotografias (2 por exercício do plano) usadas na demonstração do Treino.

Os kanji são **texto** (Noto Sans JP), não imagens: 肉体強化 (Quartel), 脚 / 芯 (Treino), 糧 (Rações), 令 (Ordens), 昇天 (logótipo e celebração), mais o kana de cada cabeçalho.

Dois slots de imagem do utilizador (`image-slot.js`), com os mesmos ids em dois sítios: `quest-hero` (arte de topo do Quartel, também editável nas Definições) e `status-retrato` (retrato da Ficha).

## Files
- `Ascend Bleach - Prototipo.dc.html` — **fonte de verdade**: 9 ecrãs com estado real.
- `Ascend Bleach - Design System.dc.html` — tokens, componentes e estados da estética Bleach.
- `tokens.css` — variáveis CSS (`@theme`) do sistema Bleach.
- `github.md` — mapa ecrã↔ficheiro e divergências protótipo↔`main`.
- `CORRECOES.md` — o que mudou em cada revisão deste pacote.
- `Ascend Prototipo.dc.html`, `Ascend Redesign v5.dc.html`, `Ascend Redesign.dc.html` — gerações anteriores, contexto.
- `ios-frame.jsx`, `support.js`, `image-slot.js` — moldura de device, runtime e slot de imagem; **não portar**.
- `art/`, `art/c/` — SVGs (ver «Assets»: só 20 estão em uso).
- `exercises/` — fotografias da demonstração de exercício.
- `screenshots/` — capturas do protótipo Bleach, uma por ecrã: 01 Quartel · 02 Menu · 03 Dojo · 04 Treino · 05 Rações · 06 Ordens · 07 Ficha · 08 Definições · 09 Celebração.
