# Handoff: Ascend — app de treino e nutrição (tema Shinigami)

## Overview
Ascend é uma app móvel de treino + nutrição com uma camada de progressão de fantasia (patentes, reiatsu, kan, ordens diárias). Este pacote contém o protótipo interativo de alta fidelidade de cinco ecrãs ligados, mais duas explorações visuais anteriores.

**Sincronizado com `Mitsu03/Ascend@main` (28 ago 2026).** Ver `github.md` na raiz do projeto para o mapa ecrã↔ficheiro e as divergências conhecidas entre o protótipo e o código.

## About the Design Files
Os ficheiros deste bundle são **referências de design feitas em HTML** — protótipos que mostram o aspeto e o comportamento pretendidos, **não código de produção para copiar**. O trabalho é **recriar estes ecrãs no ambiente já existente do codebase** (React Native, SwiftUI, Flutter, React web…) usando os seus padrões, componentes e bibliotecas. Se ainda não existir ambiente, escolher o framework mais adequado e implementar lá.

`Ascend Prototipo.dc.html` corre num runtime próprio (`support.js`, template + classe de lógica). Ignorar esse runtime: interessa o markup inline-styled (valores exatos) e a lógica de estado descrita abaixo.

## Fidelity
**Alta fidelidade.** Cores, tipografia, espaçamentos, raios, sombras e microinterações são finais. Recriar pixel a pixel com as bibliotecas do codebase. As duas explorações antigas (`Ascend Redesign*.dc.html`, tema claro em papel) são **contexto histórico** — a direção final é a do protótipo (tema escuro laranja/carmim).

## Idioma
Toda a UI está em **português de Portugal**. A copy exata está nos ficheiros; manter verbatim.

## Device frame
Desenhado para 402 × 874 pt (iPhone 16 Pro). Safe area inferior de 26 px reservada abaixo da tab bar; o topo dos ecrãs começa a 58 px (abaixo do notch).

---

## Screens / Views

### 1. Quartel (home) — `data-screen-label="Quartel"`
**Purpose:** estado do dia num ecrã — quem sou, o treino de hoje, comida e ordens.

**Layout:** coluna. Header fixo (`padding:58px 20px 0`) + área scrollável (`flex:1; overflow-y:auto; padding:14px 20px 104px`). Fundo `#0a0a0e` com `radial-gradient(44rem 30rem at 50% -12%, rgba(255,122,26,.14), transparent 60%)`.

**Header row (space-between):**
- Esquerda: medalhão 32×32 (círculo, borda `rgba(232,54,92,.5)`, glow radial `rgba(232,54,92,.14)`) com `crossed-swords-crimson.svg` 17×17; ao lado, duas linhas — nome 12/600 `#f2f3f7` e patente 11 `#a2a4b4`. Toda a zona é botão de 44 px que leva à Ficha.
- Direita: streak (`fire-ray-warn.svg` 13×13 + número Rajdhani 15/700 `#ff9f1c` + "dias") e kan (bola 8 px `#ffb020` + número Rajdhani 15/700 `#ffb020`, tabular-nums, + "kan").

**Cartão "Ordem do dia" (herói):**
- `padding:22px 22px 0`, `border:1px solid rgba(255,122,26,.4)`, `border-radius:22px`, `background:linear-gradient(165deg,#181820,#0d0d13)`, `box-shadow:0 20px 60px -22px rgba(255,122,26,.55)`, `overflow:hidden`.
- Arte decorativa dentro do cartão: `katana-ember.svg` 190×190 em `top:-30px; right:-40px; opacity:.05; rotate(14deg)`; kanji 隊 Zen Old Mincho 150 px `rgba(242,243,247,.045)` em `bottom:-26px; left:-8px`; `hell-butterfly-crimson.svg` 20×20 em `top:20px; right:20px; opacity:.55; rotate(-16deg)`; duas partículas 2–3 px (`#ffa04d`, `#8fd4ff`) com animação `pmote` (8 s / 10 s).
- Conteúdo: eyebrow "ORDEM DO DIA" 10.5/700, letter-spacing .24em, `#ffa04d`; título "Inferior A" Rajdhani 44/700, line-height 1.02, `text-shadow:4px 4px 0 rgba(184,18,54,.55)`; subtítulo "Quadríceps e glúteos" 13/600 `#ffa04d`; meta "6 exercícios · 18 séries · ~48 min" 12.5 `#a2a4b4`.
- Dois chips pill: "+198 reiatsu" (`rgba(255,122,26,.13)` / `#ffa04d`) e "+47 kan" (`rgba(255,176,32,.13)` / `#ffcd5e`), 11.5/700, padding 6/11.
- CTA: largura total, altura 56, radius 15, `linear-gradient(135deg,#ff7a1a,#b81236)`, texto `#0a0a0e` Rajdhani 19/700 letter-spacing .06em, `box-shadow:0 12px 32px -10px rgba(255,122,26,.9)`. Label dinâmico: "COMEÇAR" → "CONTINUAR SESSÃO" (sessão a decorrer) → "TREINAR OUTRA VEZ" (treino do dia já feito).
- Rodapé do cartão (full-bleed, `margin:22px -22px 0`): "PATENTE 07" 10/600 `#a2a4b4` + "1 340 / 1 852" Rajdhani 13/600 `#ffa04d`; barra 3 px `#1f1f2b` com fill `linear-gradient(90deg,#b81236,#ff7a1a)`, glow, e brilho a atravessar (`psweep`, 3.4 s linear infinite).

**Cartão "Rações de hoje"** (`margin-top:18px; padding:16px 18px; border:1px solid #23232f; border-radius:18px; background:#12121a`):
- Header: "RAÇÕES DE HOJE" 10.5/600 .16em `#a2a4b4` + link "Registar" 11.5/600 `#ff7a1a` (navega para Rações).
- Linha de valores: kcal consumidas Rajdhani 34/700 tabular; "de 2 680 kcal" 12 `#a2a4b4`; à direita "faltam N kcal" 11.5/700 `#ffa04d`.
- Barra 4 px `#1f1f2b` + fill `linear-gradient(90deg,#b81236,#ff7a1a)` (percentagem de kcal sobre a meta, cap 100).
- Duas linhas com barra própria (gap 11): **Proteína** `N de 158 g` (fill `#ff7a1a`) e **Água** `1,6 de 2,5 L` (fill `#8fd4ff`); label 11.5 `#c9cbd8`, valor 11.5/600 `#f2f3f7` tabular, barra 5 px radius 999.

**Ordens do dia:** header "ORDENS DO DIA · 1 de 3" + link "Ver todas". Três linhas-botão (grid `20px 1fr auto`, gap 11, min-height 56, padding 11/13, radius 13): checkbox 20×20 radius 6 (indicador de estado, não controlo), título 12.5 + linha de progresso 10.5 `#a2a4b4` (`1 600 de 2 500 ml`, `87 de 120 g de proteína`, `ainda sem sessão hoje`), recompensa "+25" ou "CUMPRIDA" 10.5/700. Feito: borda `rgba(61,220,151,.4)`, fundo `rgba(61,220,151,.07)`, checkbox cheio `#3ddc97` com ✓ `#0a0a0e`, texto `#3ddc97`. Pendente: borda `#2c2c3b`, fundo `#16161f`, checkbox borda `#414155`, recompensa `#ffa04d`. **Toque navega para o ecrã onde a ordem se cumpre** (hidratação e proteína → Rações, treino → Dojo); o prémio entra sozinho ao atingir o alvo, não há marcação manual.

**Frase do dia** (`narrative.ts`): cartão `rgba(255,122,26,.05)` com borda `rgba(255,122,26,.25)`, radius 18, `spark-spirit-soft.svg` 16×16 e texto 12.5/1.6 `#f2f3f7`. A frase muda com o estado do dia (treino feito, ordens em falta, série de dias, proteína atrasada).

**Cartão de dias de serviço:** eyebrow "DIAS DE SERVIÇO", número Rajdhani 34/700 `#ff9f1c` + "dias", "Melhor marca: 12 dias", `fire-ray-warn.svg` 30×30 a `opacity:.4` à direita e a linha da Licença (guardada / usada). Sem penalizações por falhar um dia.

### 2. Dojo — `data-screen-label="Dojo"`
Duas vistas no mesmo ecrã: **plano** e **sessão**.

Fundo: gradiente radial laranja em baixo (`at 50% 108%`); kanji 刃 200 px `rgba(242,243,247,.035)` em `top:150px; left:-34px`; `katana-faint.svg` 150×150 `opacity:.055; rotate(-22deg)` em `bottom:120px; right:-38px`.

**Vista plano:** cabeçalho "Dojo · plano da semana"; tira de 7 dias (flex, gap 5, radius 11, borda/fundo conforme estado feito / hoje / vazio, com ponto 17 px e marca ✓ ou —); cartão "TREINO DE HOJE" (mesmo vocabulário do herói, título Rajdhani 32); chips "6 exercícios / 18 séries / ~48 min / Intermédio"; CTA "COMEÇAR SESSÃO"; lista de exercícios expansível (nome, grupo, séries × reps, descrição ao abrir, com contagem `2/4` à direita enquanto está a meio); botão "Criar treino" 48 px; cartão "SESSÕES RECENTES" com as últimas quatro sessões (nome, data, séries, minutos, reiatsu).

**Vista sessão:** ecrã sem tab bar. Header: voltar ← 44×44, pontos de exercício tocáveis (saltam para o exercício), cronómetro e pausa 44×44 — em pausa o cronómetro e o botão passam a `#ff9f1c`. Linha "EXERCÍCIO n DE 6" + total de séries; a secção de séries conta só o exercício atual. Cronómetro `mm:ss` a correr; nome do exercício Rajdhani 50 px (42 px se tiver mais de 17 caracteres); eyebrow grupo · equipamento; reps; "série 2 de 4"; link "ver movimento" que abre a demonstração do exercício (duas fotografias de `exercises/` a alternar, animação `pdemo` 2 s, caixa 4/3 radius 14); grelha de séries tocáveis (marcar dispara o descanso e avança o exercício quando a última fecha); timer de descanso (`descanso`/`descansoTotal`); botões pausar e concluir; "Terminar sessão" (44 px) quando há séries feitas mas a sessão está incompleta — a recompensa é proporcional, sem penalizações.

### 3. Rações — `data-screen-label="Rações"`
Fundo com radial carmim (`at 82% -8%`), kanji 糧 196 px em `top:118px; right:-40px`, `soul-vessel-faint.svg` 140×140 em `bottom:130px; left:-30px` (opacity .05).

Conteúdo: total de kcal (Rajdhani grande) + "faltam para a meta" / "acima da meta"; barra de kcal; **bloco de registo** — CTA primário largura total "FOTOGRAFAR REFEIÇÃO" (56 px, gradiente do CTA) e, abaixo, dois botões 48 px "Código de barras" / "Pesquisar alimento", com linha de nota explicativa ao toque (no protótipo não há câmara); três cartões de macro (Proteína / Hidratos / Gordura) com valor, meta e barra; bloco de hidratação (borda `rgba(143,212,255,.32)`, botões +250 ml e +500 ml, barra `#8fd4ff`); bloco de sugestões (`spark-spirit-soft.svg` + alimentos que fecham a proteína, com botão adicionar); diário por refeição (Pequeno-almoço / Almoço / Lanche / Jantar) com botão "+ Adicionar" 44 px por refeição e entradas removíveis (✕ 40×40); lista de registo rápido precedida por chips 38 px que escolhem a refeição de destino.

### 4. Ordens — `data-screen-label="Ordens"`
Fundo radial dourado, kanji vertical decorativo à esquerda (15 px, letter-spacing .34em), kanji 令 200 px em `top:126px; right:-42px`, `hell-butterfly-faint.svg` 120×120 em `bottom:140px; left:-26px`. Cartão "Ordem: Ascensão" (ordem semanal, `sword-hilt-gold.svg` 34×34), progresso das ordens semanais (capitão: 3 treinos; semana de ferro: 4 treinos; rio: 15 000 ml) e as três ordens diárias.

### 5. Shinigami (ficha) — `data-screen-label="Ficha"`
**Não alterar a arte deste ecrã — pedido explícito do utilizador.** Retrato com `grim-reaper-crimson.svg` 50×50 sobre máscara SVG inline (gradientes `pbone`), anel cónico repetido no fundo, patente + nome, quatro artes (Zanjutsu `katana-ember`, Hohō `quick-slash-good`, Kidō `fire-ray-crimson`, Reiryoku `aura-gold`) em cartões de 4 colunas, e a grelha das **10 conquistas** de `data/achievements.ts` em 5 colunas: emblema `-soft` quando ganha (borda `rgba(255,176,32,.45)`, fundo `rgba(255,176,32,.08)`, nome `#ffcd5e`), `-faint` a `opacity:.45` quando bloqueada, com o progresso (`7/10`) no canto inferior direito. No estado da demonstração estão 8 de 10: faltam "Máscara de Hollow" (patente 10) e "Forja da Asauchi" (criar um treino).

### 6. Celebração (overlay de fim de sessão)
Fundo `#050507`, radial carmim, partículas, máscara SVG grande, "SESSÃO CONCLUÍDA" ou "SUBIDA DE PATENTE" + nome da patente (Rajdhani 44, text-shadow carmim), três colunas de recompensa (REIATSU / KAN / ARTES) e, se a sessão foi 100 %, o cartão de cosmético "Selo Shikai" (clip-path com cantos cortados a 18 px). CTA "VOLTAR AO QUARTEL". Sem tab bar.

### Tab bar (todos os ecrãs exceto sessão e celebração)
5 colunas, `border-top:1px solid #1f1f2b`, `background:rgba(16,16,23,.94)` (blur), `padding-bottom:26px`. Ícone dentro de pill 34×24 radius 8; ativo: fundo `rgba(255,122,26,.16)`, label `#ff7a1a`; inativo `#a2a4b4`. Ordem e ícones: Quartel `shinto-shrine`, Dojo `katana`, Rações `soul-vessel`, Ordens `hell-butterfly`, Shinigami `hollow-mask`.

---

## Interactions & Behavior
- Navegação: tab bar troca de ecrã; "Ver todas" → Ordens; "Registar" → Rações; CTA do Quartel → Dojo (vista sessão, arranca a sessão).
- Marcar série: alterna; ao marcar arranca o descanso (`descanso` do exercício, 45–90 s); se todas as séries do exercício ficarem feitas, avança para o exercício seguinte.
- Timer global de 1 s: incrementa `decorrido` só na vista sessão e sem pausa; decrementa `descanso` até null, também parado em pausa.
- Concluir sessão: calcula recompensa, marca a ordem "treino", incrementa artes (zanjutsu +1, hohō +1, kidō +1 apenas se 100 %), abre a Celebração; se a patente subiu, variante "SUBIDA DE PATENTE" e cosmético quando 100 %.
- Ordens: sem marcação manual. Tocar navega para o ecrã da ordem; hidratação fecha aos 2 500 ml, proteína aos 120 g e treino ao concluir sessão (que também paga o prémio da ordem, uma só vez por dia).
- Rações: adicionar alimento acrescenta entrada ao diário (porção padrão do catálogo); remover entrada; +250/+500 ml de água alimenta a ordem de hidratação e a ordem semanal do rio.
- Animações: `pglow` (pulsar opacidade, ~2 s), `psweep` (brilho a atravessar a barra, 3.4 s linear infinite), `pmote` (partícula a subir 120 px com fade, 8–10 s), `ppop` (entrada da celebração, .5 s ease).
- Botões usam `cursor:pointer` e `-webkit-tap-highlight-color:transparent`; no target nativo usar press state a ~92 % de opacidade.

## State Management
```
tela: 'quartel' | 'dojo' | 'racoes' | 'ordens' | 'ficha' | 'celeb'
xp, kan, dias (streak), treinos, treinosSemana
artes: { zanjutsu, hoho, kido, reiryoku }
ordens: { hidratacao: bool, treino: bool, proteina: bool }
diario: [{ k, ref (índice da refeição), id (alimento), g }]
agua (ml), seq (contador de chaves), refRapida (refeição de destino do registo rápido), aviso
dojoVista: 'plano' | 'sessao'; expandido; emSessao; pausado
marcadas: bool[][] (exercício × série); exercicio; decorrido (s); descanso; descansoTotal
celeb: { xp, kan, feitas, total, segundos, subiu, nivel, cosmetico } | null
```
Sem fetch: tudo local. Numa app real, o que persiste é `diario`, `agua`, `marcadas` e `xp`/`kan`.

**Fórmulas (implementar exatamente):**
```js
xpDoNivel(n)   = round(100 * n ** 1.5)
xpTotalAte(n)  = soma de xpDoNivel(1..n-1)
nivelDeXp(xp)  = maior n com xp >= xpTotalAte(n) → { nivel, atual, proximo }
recompensaSessao(feitas, total, segundos):
  taxa = feitas / total
  xp  = round(40 + feitas*6 + (taxa >= 1 ? 30 : 0) + min(20, floor(segundos/60)))
  kan = round(10 + feitas*1.5 + (taxa >= 1 ? 10 : 0))
```
Patentes por nível: 1 Alma de Rukongai · 3 Aluno da Academia Shinʼō · 5 Shinigami sem Patente · 7 Oficial de Divisão · 10 Terceiro Oficial · 14 Tenente · 18 Capitão · 25 Capitão-Comandante.

Metas: kcal 2 680 · proteína 158 g · hidratos 275 g · gordura 74 g · água 2 500 ml.
Estado da demonstração (`data/demoUser.ts`): Kai, Décima Primeira Divisão, patente 7, 320 kan, 5 dias de serviço (melhor 12), 12 treinos, 34 ordens cumpridas, 1 250 ml de água, pequeno-almoço e almoço registados.
Ordens diárias: hidratação (2 500 ml) +25 xp / +6 kan; treino do dia +40 / +10; proteína (120 g) +35 / +10.
Catálogo de alimentos, plano de treino e semana: constantes `ALIMENTOS`, `PLANO`, `SEMANA` no fim do protótipo — copiar tal e qual.

## Design Tokens
**Cores**
```
Fundo app        #0a0a0e     Fundo body     #08080b     Celebração   #050507
Superfícies      #12121a · #16161f · #181820 · #0d0d13
Bordas           #1f1f2b · #23232f · #2c2c3b · #414155
Texto            #f2f3f7     Texto 2        #c9cbd8     Texto suave  #a2a4b4
Primária         #ff7a1a     Laranja claro  #ffa04d
Âmbar            #ffb020 · #ffcd5e · #ff9f1c
Carmim           #b81236     Rosa-carmim    #e8365c     Verde ok     #3ddc97
Azul espírito    #8fd4ff
Gradiente CTA    linear-gradient(135deg,#ff7a1a,#b81236)
Gradiente barra  linear-gradient(90deg,#b81236,#ff7a1a)
Gradiente cartão linear-gradient(165deg,#181820,#0d0d13)
```
**Tipografia:** Rajdhani 500/600/700 (números, títulos, CTAs) · Inter 400–700 (corpo e UI) · Zen Old Mincho 700 (kanji decorativo). Escala usada: 9.5, 10, 10.5, 11, 11.5, 12, 12.5, 13, 15, 19, 23, 25, 32, 34, 44, 50. Eyebrows: 10–10.5 px, 600/700, letter-spacing .14–.24em, maiúsculas.

**Espaçamento:** 4, 5, 6, 7, 8, 9, 11, 13, 14, 16, 18, 20, 22, 26 (padding lateral dos ecrãs 20–22).

**Raios:** 6, 8, 10, 11, 13, 14, 15, 16, 18, 20, 22, 999 (pills).

**Sombras:** `0 20px 60px -22px rgba(255,122,26,.55)` (cartão herói) · `0 12px 32px -10px rgba(255,122,26,.9)` (CTA) · `0 0 14px rgba(255,122,26,.9)` (glow de barra).

## Assets
`art/` e `art/c/` — 134 SVGs de linha (base game-icons, recolorados por tom: `-crimson, -ember, -faint, -gold, -good, -muted, -soft, -spirit, -warn`). Famílias usadas: katana, crossed-swords, fire-ray, quick-slash, sword-hilt, hell-butterfly, hollow-mask, grim-reaper, shinto-shrine, soul-vessel, spark-spirit, aura, third-eye, kimono. Exportar como vetores no target (SVG ou asset catalog) e manter os pares tom↔uso indicados por ecrã.

A máscara do retrato e da celebração é SVG inline no protótipo (gradientes `pbone` / `cbone`) — extrair como asset. Os kanji decorativos são texto (Zen Old Mincho), não imagens: 隊 (Quartel), 刃 (Dojo), 糧 (Rações), 令 (Ordens).

## Files
- `Ascend Prototipo.dc.html` — **fonte de verdade**: 5 ecrãs + celebração, com estado real.
- `Ascend Redesign.dc.html`, `Ascend Redesign v5.dc.html` — explorações anteriores (tema claro), contexto.
- `ios-frame.jsx`, `support.js` — moldura de device e runtime do protótipo; **não portar**.
- `art/`, `art/c/` — ícones SVG.
- `screenshots/` — capturas 2× do protótipo, uma por tab: 01 Quartel · 02 Dojo · 03 Rações · 04 Ordens · 05 Shinigami.
