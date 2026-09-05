# Correções ao pacote

## Revisão 2 — 2 set 2026 (resposta à segunda validação)

A revisão 1 corrigiu uma secção e deixou o resto do documento a descrever outro
protótipo. Esta revisão trata o README como o problema que era.

### N1 — o README descrevia o protótipo errado
**Confirmado e resolvido.** O documento foi reescrito de ponta a ponta contra
`Ascend Bleach - Prototipo.dc.html`. Saíram todos os valores da geração laranja
(`#ff7a1a`, `#0a0a0e`, Rajdhani, Inter, `border-radius:18–22px`) e o disclaimer
que os desculpava. As secções «Design Tokens», «Assets», «Interactions» e as de
cada ecrã têm agora os literais do protótipo Bleach.

### N2 — a shell mudou e o README não
**Resolvido.** Há uma secção nova, «Shell — HUD + janelas», que substitui a
antiga «Tab bar»: as quatro camadas de ambiente, o HUD de 56 px, o padrão de
janela (chanfro 14 px, boot de scanline, wipe diagonal, brackets), a QUEST como
base que recua a 45 %, o `[ MENU ]`, o toast e o modal. Os ecrãs passaram de
5 + 1 a **nove**, cada um com o seu `data-screen-label` e código `ASC//0n`. A
Ficha está documentada nas três faces (PROGRESSO / CONQUISTAS / ARSENAL), com
pesagens, gráfico de 7 dias e inventário. Saiu a frase «não alterar a arte deste
ecrã», que já não descrevia nada.

### N3 — o `github.md` contradizia o protótipo
**Resolvido.** Nova sincronização (2 set, `847d52f58207`). As três divergências
que já não existiam — plano com IA, registo por texto, Definições — passaram a
fechadas, com data. Entraram três divergências reais e novas: a **shell** (o
`main` tem tab bar e Definições dentro da Ficha; o protótipo tem HUD + MENU e
Definições como módulo próprio), os **ícones** (sprite inline vs. ficheiros de
`art/`) e os **formulários representativos**. O mapa ecrã↔ficheiro passou de 10
para 14 linhas, com as três faces da Ficha separadas e os ficheiros confirmados
no `main` (`ProgressCharts.tsx`, `InventoryPanel.tsx`, `CustomWorkoutModal.tsx`).

### N4 — o bloco State Management era o estado antigo
**Resolvido.** Lista completa a partir de `ESTADO_INICIAL()`: entraram `menu`,
`modal`, `toast`, `face`, `abaRacoes`, `painel`, `idioma`, `divisao`, `fundo`,
`penteado`, `matiz`, `brasao`, `verDemo`, `melhor`, `licenca`, `ordensCumpridas`
e `treinosSemana`; saiu `aviso`. Acrescentada a fórmula `rankDe(n)` e a lista de
constantes a copiar.

### P5 — as capturas eram as antigas
**Resolvido.** Nove capturas novas, feitas do protótipo Bleach a 1,5× (603 × 1311),
uma por ecrã: `01-quartel`, `02-menu`, `03-dojo`, `04-treino`, `05-racoes`,
`06-ordens`, `07-ficha`, `08-definicoes`, `09-celebracao`. As cinco antigas
(pill «Foto · código», tab bar, paleta laranja) foram apagadas.

### P7 — classificação errada do `v5`
**Resolvido.** `Ascend Redesign v5.dc.html` está descrito como o que é: o
antecessor direto do Bleach, escuro (`#0a0a0e`), laranja `#ff7a1a`, Rajdhani. O
tema claro em papel é o `Ascend Redesign.dc.html` (`#c9c1b2`, carmim `#b3231a`).

### Menor — `tokens.css`
O comentário deixou de afirmar espelho 1:1 e passa a registar a exceção:
`--color-crimson-deep` (#7a1024) só aparece no protótipo como
`rgba(122,16,36,.28/.35)` nos gradientes de ambiente. Acrescentado
`--color-kido-bright` (#5cc8ff), que o protótipo usa na hidratação e faltava.

### Defeitos de empacotamento encontrados nesta revisão
Não vinham na validação, mas quebravam o pacote:
- **`image-slot.js` faltava** — o protótipo Bleach e o `Ascend Redesign` importam-no
  para os dois slots de imagem (`quest-hero`, `status-retrato`). Incluído.
- **`exercises/` faltava** — as 12 fotografias da demonstração de exercício do
  ecrã Treino. Incluídas.

---

## Revisão 1 — 2 set 2026 (resposta à primeira validação)

### P1 — `tokens.css` não pertencia ao pacote
**Causa:** erro de empacotamento. O `tokens.css` é do sistema Bleach e o zip
levava o protótipo da geração anterior. **Resolvido:** `Ascend Bleach -
Prototipo.dc.html` e `Ascend Bleach - Design System.dc.html` passaram a estar
incluídos e são a fonte de verdade.

### P2 — secção "Rações" descrevia um ecrã inexistente
**Resolvido:** reescrita a partir do protótipo Bleach — três separadores
ESTADO / DIÁRIO / REGISTAR, sem CTA de fotografia nem botões de código de barras.

### P3 — Rações uma versão atrás do `main`
**Já estava alinhado no protótipo, não no README.** Resolvido na reescrita, com
referência a PR #4 e PR #5.

### P4 — metas de macros divergentes
**Divergência real, não erro de escrita.** `METAS` fixo no protótipo vs.
`computeTargets(DEMO_PROFILE)` = 2 800 / 133 / 392 / 78. **Decisão: o código
manda.** Registado no README e no `github.md`.

### P8 — `github.md` fora do pacote
**Resolvido:** passou a ir dentro da pasta.

## Como ler este pacote
Direção visual, não especificação literal. O que é literal: as fórmulas de XP e
recompensa, as oito patentes, as três ordens diárias com alvos e prémios, as 10
conquistas, os tokens de cor, tipografia e forma. O que é maquete: as metas de
macros, o estado da demonstração, os catálogos de alimentos, cosméticos e o plano
de treino.
