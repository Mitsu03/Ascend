# Ascend — fonte no GitHub

repo: Mitsu03/Ascend
branch: main
path: src

React 19 + TypeScript + Vite + Tailwind v4, zustand com `persist`, PWA + wrapper iOS
(Capacitor 8). UI em português de Portugal, inglês nas definições. Sem backend.

## Last sync

date: 2026-09-02T13:43:00Z
commit: 847d52f58207

Releitura do `main` para alinhar este ficheiro com o protótipo Bleach, que é agora
a fonte de verdade do desenho. O `main` não mudou desde 1 de setembro; o que mudou
foi o protótipo — e três divergências que aqui estavam abertas fecharam-se por isso.

### Updated in this project

- Protótipo Bleach passa a ter nove ecrãs (Quartel, Menu, Dojo, Treino, Rações,
  Ordens, Ficha, Definições, Celebração) e **não tem tab bar**: o HUD abre o
  `[ MENU ]` e cada módulo é uma janela sobre a `[ QUEST ]`.
- Fecharam: «Plano com IA» (o protótipo tem os dois botões), registo por texto
  (o protótipo tem as duas portas, `FOTO` e `TEXTO`) e Definições (módulo
  `ASC//06`, com imagens do utilizador, véu de contraste e modo brasão).
- Ficha ganhou três faces — `PROGRESSO` / `CONQUISTAS` / `ARSENAL` — com
  gráficos de 7 dias, pesagens e inventário.
- Pacote de handoff (`design_handoff_ascend/`) reescrito contra este protótipo.

## Screen map

| Ecrã do protótipo | Ficheiros do repositório |
| --- | --- |
| HUD + Menu (`[ MENU ]`) | `src/components/layout/AppShell.tsx`, `src/components/layout/ScreenHeader.tsx` — **divergência de estrutura:** o `main` tem tab bar de 5 colunas |
| Quartel (`[ QUEST ]`) | `src/features/dashboard/DashboardPage.tsx`, `src/features/quests/OrderRow.tsx`, `src/services/narrative.ts` |
| Dojo (`[ DOJO ]`) | `src/features/workout/WorkoutPage.tsx`, `src/features/workout/ExerciseDemo.tsx`, `src/features/workout/AiPlanModal.tsx`, `src/features/workout/CustomWorkoutModal.tsx`, `src/data/exercises.ts` |
| Treino (`[ SESSION ]`) | `src/features/workout/WorkoutSessionPage.tsx` |
| Rações (`[ RATIONS ]`) | `src/features/nutrition/NutritionPage.tsx`, `src/features/nutrition/PhotoLogModal.tsx`, `src/services/suggestions.ts`, `src/services/foodVision.ts`, `src/services/visionProviders.ts` |
| Ordens (`[ ORDERS ]`) | `src/features/quests/QuestsPage.tsx`, `src/features/quests/QuestCard.tsx`, `src/data/quests.ts` |
| Ficha (`[ STATUS ]`) — PROGRESSO | `src/features/profile/ProfilePage.tsx`, `src/features/profile/ProgressCharts.tsx`, `src/data/divisions.ts` |
| Ficha — CONQUISTAS | `src/features/profile/AchievementsGrid.tsx`, `src/data/achievements.ts` |
| Ficha — ARSENAL | `src/features/profile/InventoryPanel.tsx`, `src/data/cosmetics.ts` |
| Definições (`[ CONFIG ]`) | `src/features/profile/ProfilePage.tsx` (face «Settings», dentro da Ficha no `main`), `src/features/profile/ArtworkPanel.tsx`, `src/store/artStore.ts`, `src/services/userArt.ts`, `src/i18n/` |
| Celebração | `src/features/workout/CelebrationScreen.tsx` |
| Fundos e imagens do utilizador | `src/components/layout/ScreenBackdrop.tsx`, `src/store/artStore.ts`, `src/components/HeroAvatar.tsx`, `src/data/artIcons.ts` |
| Tokens | `src/index.css` (`@theme`) — migração por `design_handoff_ascend/tokens.css` |
| Estado da demonstração | `src/data/demoUser.ts`, `src/services/calculations.ts` |

## Divergências conhecidas (protótipo ≠ app)

- **Shell (aberta a 2026-09-02, a maior):** o protótipo não tem tab bar. O HUD é a
  única peça fixa, abre o `[ MENU ]` de seis módulos e cada ecrã materializa-se
  como janela chanfrada sobre a `[ QUEST ]`, que fica atrás a 45 % de opacidade.
  O `main` tem `AppShell` com tab bar de 5 colunas e as Definições dentro da Ficha.

- **Estética Bleach (aberta a 2026-09-02):** preto de shihakushō e carmim profundo,
  branco de osso, laranja de reiatsu no Sistema, carmim em HP e destrutivo, ouro do
  Gotei na moeda, azul de kidō na confirmação; Saira Condensed + IBM Plex Mono +
  Barlow + Noto Sans JP; chanfros em vez de raios, brackets, boot de scanline, wipe
  diagonal, toasts de sistema. «Ascend Neon» fica como variante ciano/magenta. O
  `main` continua nos tokens antigos (`src/index.css` `@theme`).

- **Ícones (aberta a 2026-09-02):** o protótipo abandonou os SVGs de `art/` na UI e
  usa um sprite inline de 30 símbolos de traço (1,5 px, `currentColor`). Só as 10
  conquistas continuam a usar ficheiros (`art/c/*-spirit.svg` e `-faint.svg`).

- **Metas de macros (aberta):** o protótipo tem `METAS` fixo (2 680 / 158 / 275 / 74);
  `computeTargets(DEMO_PROFILE)` devolve 2 800 / 133 / 392 / 78. **Decisão: o código
  manda** — a ordem de proteína do protótipo (120 g) já é 133 × 0,9.

- **Formulários (aberta):** na Ficha e nas Definições os formulários são
  representativos — pesagem, criador de treinos, plano com IA, foto e texto abrem um
  modal de sistema a descrever o comportamento no produto, em vez de o executarem.

- **Fechadas a 2026-09-02:** Dojo (o protótipo passou a ter «PLANO COM IA» e «CRIAR
  TREINO»); Rações (as duas portas de registo, fotografia e texto); Definições
  (existem no protótipo, `data-screen-label="Definições"`), incluindo os dois slots
  de imagem do utilizador, o véu de contraste a 0,78 e o modo brasão.

- **Fechadas a 2026-08-30:** Celebração (ecrã inteiro nas duas pontas); atalho
  «Foto · código» fora do cabeçalho das Rações.

- **Ordens diárias:** alinhado — ordens automáticas com navegação ao toque, como
  `OrderRow`/`isAutomatic` fazem.

- **Ainda fora do protótipo:** onboarding (`OnboardingPage.tsx`), ecrã inicial
  (`StartPage.tsx`), escolha e transferência de divisão, modais de registo de
  alimento (pesquisa, código de barras), seleção de dia na tira da semana e o
  inglês (o protótipo tem só o seletor).

## Sync history

### 2026-09-01 — leitura do `main`

As duas divergências fechadas a 30 de agosto confirmadas no `main`. Encontrado e
então ainda fora do protótipo: plano com IA (`AiPlanModal.tsx`,
`services/aiPlanner.ts`), registo por texto (`NutritionPage.tsx`, `foodVision.ts`),
imagens do utilizador (`artStore.ts`, `userArt.ts`, `ArtworkPanel.tsx`,
`ScreenBackdrop.tsx`, `DEFAULT_SCRIM` 0,78) e modo brasão (`HeroAvatar.tsx`,
`data/artIcons.ts`). Todos entraram no protótipo Bleach a 2 de setembro.

### 2026-08-30 — o código seguiu o protótipo

Sincronização ao contrário das anteriores: as duas divergências que estavam por
fechar foram resolvidas a favor do desenho, na branch
`design/alinha-protocolo-celebracao-racoes`, hoje no `main`.

- **Celebração** (`CelebrationScreen.tsx`) passou de painel modal a ecrã inteiro.
- **Rações** (`NutritionPage.tsx`): a `HeaderAction` "Foto · código" saiu do
  cabeçalho e a fotografia passou a uma linha tracejada de 60 px no topo do diário.
- Correção: a copy `celebration.noReward` prometia 15 kan que `workoutRewards`
  nunca deu. Saiu com o resto.

## Estado de publicação

A app está na TestFlight: `com.mitsu03.ascend`, app 6806061392, build 1.0 (2)
carregada a 2026-08-30 e distribuída ao grupo interno Dev. A inscrição no
Apple Developer Program está aprovada.
