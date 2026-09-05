# Validação do handoff — 2 set 2026

Pacote recebido: `Ascend.zip` (146 ficheiros, 3,1 MB).
Validado contra `main` em **847d52f** (PR #4 e PR #5 já integrados).

O handoff declara-se sincronizado com `Mitsu03/Ascend@main` de **28 ago 2026**.
Desde essa data entraram em `main` o assistente de IA (PR #5) e o redesenho da
celebração com a simplificação das Rações (PR #4). Parte das divergências
abaixo vem daí; outra parte é incoerência interna do próprio pacote.

---

## Veredicto

**Aproveitável como direção visual. Não aproveitável como especificação
literal.**

Cores, tipografia, ritmo e a estrutura de Quartel / Dojo / Ordens / Ficha estão
coerentes e já batem certo com o código. Mas `tokens.css` pertence a outro
sistema de design, a secção "Rações" do README descreve um ecrã que não existe
em lado nenhum, e o pacote está uma versão atrás do `main` em tudo o que é
registo de refeições.

Quatro coisas a resolver antes de implementar: P1, P2, P3 e P4.

---

## Integridade do pacote

| Verificação | Resultado |
|---|---|
| Ficheiros | 146 (134 SVG, 3 HTML, 5 PNG, `tokens.css`, `ios-frame.jsx`, `support.js`, `README.md`) |
| SVG bem formados | 134/134 — todos XML válido |
| Segredos ou credenciais | nenhum |
| "134 SVGs" (afirmação do README) | confirmado |
| Moldura 402 × 874, topo 58 px, safe area 26 px | confirmado no protótipo |
| Ecrãs no protótipo | 6 — Quartel, Dojo, Rações, Ordens, Ficha, Celebração |

---

## O que bate certo com o código

Verificado ficheiro a ficheiro; nada aqui precisa de mudar.

- **Fórmulas de progressão** — `src/services/calculations.ts` implementa
  exatamente o que o handoff manda: `xpForLevel = round(100 · n^1.5)`,
  `totalXpForLevel`, `levelFromXp`, e
  `workoutRewards = round(40 + 6·séries + 30 se 100 % + min(20, ⌊seg/60⌋))`
  com `kan = round(10 + 1,5·séries + 10 se 100 %)`.
- **Patentes** — `LEVEL_TITLES` tem os mesmos oito degraus (1, 3, 5, 7, 10, 14,
  18, 25), da Alma de Rukongai ao Capitão-Comandante.
- **Estado da demonstração** — `src/data/demoUser.ts` confere em todos os
  valores citados: Kai, Décima Primeira Divisão, patente 7, 320 kan, 5 dias de
  serviço (melhor 12), 34 ordens cumpridas, 1 250 ml de água, pequeno-almoço e
  almoço registados.
- **Ordens diárias** — `src/data/quests.ts`: água 2 500 ml → +25 XP / +6 kan;
  treino → +40 / +10; proteína 120 g → +35 / +10. Os três pares batem certo.
- **Conquistas** — são 10 (`src/data/achievements.ts`), e as duas que ficam
  bloqueadas na demonstração são mesmo as que o handoff nomeia: *Máscara de
  Hollow* (patente 10, a demo está na 7) e *Forja da Asauchi*
  (`customWorkouts: 0`). 8 de 10, como descrito.
- **Meta de água** — `WATER_GOAL_ML = 2500`.
- **Paleta e tipografia da secção "Design Tokens"** — idênticas ao `@theme` de
  `src/index.css`: `#0a0a0e`, `#12121a`, `#1f1f2b`, `#ff7a1a`, `#ffa04d`,
  `#b81236`, `#e8365c`, `#8fd4ff`, `#3ddc97`, `#f2f3f7`, Rajdhani + Inter +
  Zen Old Mincho.

---

## Divergências

### P1 — `tokens.css` não pertence a este pacote

O ficheiro descreve **outro** sistema de design: `--color-void: #0c0e13`,
`--color-link: #ff8a14`, `--color-signal: #c8102e`, tipos Saira Condensed /
Barlow / IBM Plex Mono, e chanfros (`clip-path`) em vez de raios. O próprio
cabeçalho diz que espelha *«Ascend Bleach - Prototipo.dc.html»* — ficheiro que
não existe neste pacote.

Contradiz a secção "Design Tokens" do README **e** o `src/index.css` atual.
É resíduo de um redesenho anterior. **Não usar.**

### P2 — A secção "3. Rações" descreve um ecrã que não existe

O README especifica um bloco de registo com CTA primário a toda a largura
*"FOTOGRAFAR REFEIÇÃO"* (56 px) e dois botões de 48 px *"Código de barras"* e
*"Pesquisar alimento"*.

Nenhuma dessas três strings existe no protótipo (`grep` = 0 ocorrências), e a
captura `screenshots/03-racoes.png` — do próprio pacote — mostra outra coisa:
um pill *"Foto · código"* no header e um cartão herói *"FALTAM PARA A META"*.

O README e o protótipo discordam sobre o ecrã que o README declara ser o mais
detalhado do pacote.

### P3 — O ecrã Rações está uma versão atrás do `main`

Mesmo o que o protótipo mostra já não é o desenho atual:

- o pill *"Foto · código"* no header foi **removido pelo PR #4**;
- o registo passou para linhas do diário — *"Fotografar refeição"* e
  *"Descrever refeição"* (`src/features/nutrition/NutritionPage.tsx:562` e
  `:582`, strings em `src/i18n/pt.ts:521-524`);
- o handoff **não menciona** o assistente de IA por texto (PR #5), que já está
  em `main` e é hoje um dos dois pontos de entrada do registo.

### P4 — As metas de macros não correspondem ao que a app calcula

Para o mesmo perfil da demonstração (Kai, 74 kg, 178 cm, 24 anos, masculino,
ganhar massa, 4 dias por semana):

| | kcal | Proteína | Hidratos | Gordura |
|---|---|---|---|---|
| Handoff e protótipo | 2 680 | 158 g | 275 g | 74 g |
| `computeTargets(DEMO_PROFILE)` | **2 800** | **133 g** | **392 g** | **78 g** |

(Mifflin-St Jeor 1 737,5 × fator de atividade 1,465 × 1,10 de ganho de massa.)

Ou o protótipo usa números fixos escolhidos à mão, ou o perfil da demonstração
mudou depois de o design ter sido feito. As barras dos três cartões de macro e
o "faltam N kcal" dependem disto — decidir qual manda antes de implementar.

O handoff é incoerente consigo próprio neste ponto: o alvo da ordem de proteína
(120 g, confirmado no código) é `round(proteinG × 0,9)`, o que dá 120 a partir
de **133**, não de 158 (que daria 142).

### P5 — README e capturas discordam sobre o estado da demonstração

| | README | `screenshots/01-quartel.png` |
|---|---|---|
| Barra de patente | `PATENTE 07 · 1 340 / 1 852` | `778 / 1852` |
| Ordens do dia | `1 de 3` | `0 de 3` |

A string `1 340` não existe no protótipo.

### P6 — As linhas das ordens não têm subtítulo de progresso

O README descreve uma segunda linha por ordem (`1 600 de 2 500 ml`,
`87 de 120 g de proteína`, `ainda sem sessão hoje`). Nenhuma dessas strings
existe no protótipo, e a captura mostra as linhas só com título e recompensa.
É uma boa ideia, mas está por desenhar — não está no protótipo para copiar.

### P7 — `Ascend Redesign v5.dc.html` está mal classificado

O README arruma os dois ficheiros `Ascend Redesign*` como "explorações antigas,
tema claro em papel". Só um deles é isso:

- `Ascend Redesign.dc.html` — tema de papel (`#16120d`, `#f4efe2`, `#b3231a`).
  Exploração descartada, sim.
- `Ascend Redesign v5.dc.html` — mesma paleta escura do final (`#ff7a1a`,
  `#050507`, `#a2a4b4`) e já traz o ecrã de Celebração. É o **antecessor
  direto** da direção final, não uma exploração de outro caminho.

### P8 — `github.md` é referenciado mas não existe

O README manda ver *"`github.md` na raiz do projeto para o mapa ecrã↔ficheiro e
as divergências conhecidas entre o protótipo e o código"*. Não vem no pacote
nem existe na raiz do repositório — e é exatamente o documento que resolveria
P2 a P6. **Pedir ao autor do handoff.**

### P9 — O README descreve a app, não só o protótipo

Estas passagens do README existem em `src/i18n/` mas **não** no protótipo:
"DIAS DE SERVIÇO", "Melhor marca", "Licença", "Criar treino", "SESSÕES
RECENTES", "ver movimento", "Terminar sessão".

Ou seja, o README é uma especificação combinada — protótipo mais app já feita —
o que é útil, mas contradiz a sua própria afirmação de que
`Ascend Prototipo.dc.html` é a "fonte de verdade". Onde os dois divergirem, o
README é o documento mais completo; o protótipo é que é o subconjunto.

---

## Menor

- `art/c/` (120 SVG recolorados, 541 KB) é redundante face ao código: a app
  tinge em runtime a partir dos 91 originais em `public/art/game-icons/`.
  Guardado na mesma, para o protótipo continuar a abrir.
- `ios-frame.jsx` e `support.js` são o runtime do protótipo — o README já diz
  para não os portar, e está certo.
