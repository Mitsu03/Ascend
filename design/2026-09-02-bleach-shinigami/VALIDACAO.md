# Validação do handoff — 2 set 2026 (revisão 2)

Pacote recebido: `Ascend.zip` (167 ficheiros, 3,0 MB).
Validado contra `main` em **847d52f58207b963cb5eaee7e0220916d6dd1fcb**.

É a revisão 2 do pacote validado nesta mesma data em
[`../2026-09-02-prototipo-shinigami/`](../2026-09-02-prototipo-shinigami/), e
traz consigo um `CORRECOES.md` que lista, item a item, o que corrigiu.

---

## Veredicto

**Aproveitável como especificação.** É a primeira revisão em que o README, o
`github.md`, o `tokens.css` e o protótipo descrevem todos a mesma app.

Foi implementada — a camada visual está na branch `design/estetica-bleach`. O
que ficou por resolver, e volta para o lado do desenho, está em
[`PARA-O-DESIGN.md`](PARA-O-DESIGN.md).

---

## Integridade do pacote

| Verificação | Resultado |
|---|---|
| Ficheiros | 167 (134 SVG, 12 JPG, 9 PNG, 5 `.dc.html`, 7 de documentação e runtime) |
| SVG bem formados | 134/134 — todos XML válido |
| Referências externas do protótipo | todas resolvem: `image-slot.js`, `support.js`, `ios-frame.jsx`, 12× `exercises/*.jpg`, `art/c/` |
| Segredos ou credenciais | nenhum |
| Capturas | 9 × 603 × 1311, uma por ecrã, com a paleta Bleach confirmada por amostragem de píxeis |

Face à revisão 1 entraram `CORRECOES.md`, `image-slot.js` e as 12 fotografias
de `exercises/` — as duas últimas eram defeitos de empacotamento: o protótipo
importa-as e elas não vinham.

---

## As sete correções anunciadas, verificadas

| | O que anuncia | Verificação |
|---|---|---|
| **N1** | README reescrito contra o protótipo Bleach | Confirmado. Os únicos resíduos da geração laranja (`#ff7a1a`, `#0a0a0e`, Rajdhani) estão nas linhas 21–22, a **descrever as gerações anteriores** — uso legítimo. `border-radius` no protótipo Bleach: **0 ocorrências**, como o README afirma. |
| **N2** | Secção «Shell — HUD + janelas»; nove ecrãs | Confirmado um a um por `data-screen-label`, com os brackets (`[ QUEST ]`…`[ CONFIG ]`) e os códigos `ASC//01–06`. |
| **N3** | `github.md` sincronizado, mapa ecrã↔ficheiro de 14 linhas | Confirmado. `847d52f58207` é prefixo real do HEAD, e **os 38 ficheiros do mapa existem todos**. As três divergências fechadas confirmam-se por string no protótipo (`PLANO COM IA`, `CRIAR TREINO`, `FOTO`/`TEXTO`, `data-screen-label="Definições"`); as antigas P2 (`FOTOGRAFAR REFEIÇÃO`, `Código de barras`, `Foto · código`) estão a zero. |
| **N4** | Bloco State Management a partir de `ESTADO_INICIAL()` | Confirmado: cobre as **38 chaves**, sem sobras nem faltas. `rankDe(n)` presente. |
| **P5** | Nove capturas novas do protótipo Bleach | Confirmado, incluindo as dimensões e a paleta. |
| **P7** | `v5` classificado como antecessor direto | Confirmado. |
| **tokens.css** | Exceção do `--color-crimson-deep` documentada; `--color-kido-bright` acrescentado | Confirmado. Dos 18 hex do ficheiro, 17 aparecem no protótipo; o `#7a1024` só como `rgba(122,16,36,…)` — exatamente a exceção que o cabeçalho passou a registar. |

## Contraverificações por fora do que o changelog declara

O changelog descreve o que o autor sabia estar errado. Estas passagens foram
feitas por cima:

- **Metas de macros**, recalculadas do código: BMR Mifflin-St Jeor 1 737,5 ×
  fator de atividade 1,465 (4 dias) × 1,10 de ganho de massa = **2 800 kcal**;
  74 × 1,8 = **133 g** de proteína; gordura `max(59, 78)` = **78 g**; hidratos
  `round(1566/4)` = **392 g**. O README acerta, e a ordem diária de proteína
  (120 g = `round(133 × 0,9)`) confirma que o código manda.
- **Sprite** — 30 símbolos `ic-*`, exatamente os 30 que o README lista.
- **Emblemas** — os 20 ficheiros `art/c/*-{spirit,faint}.svg` existem todos.
- **Animações** — as 13 durações que o README cita batem certo com o protótipo
  (`smat .22s`, `sscan .34s`, `swipe .26s`, `sfix .14s`, …).
- **Literais de interface** — testados 73 da secção «Screens»; os 19 que uma
  procura literal não encontra são todos artefacto de serialização
  (interpolação em runtime, `text-transform:uppercase` sobre dados em caixa
  baixa, markup a partir o literal a meio). Nenhuma invenção do README.

Foi nesta camada que apareceu a única incoerência nova — o painel «MOVIMENTO»
do protótipo declarar `boot 220 ms` quando o `sscan` corre a `.34s`. Está
descrita em [`PARA-O-DESIGN.md`](PARA-O-DESIGN.md), D2.

---

## Estado da implementação

A camada visual foi aplicada (branch `design/estetica-bleach`): tokens,
chanfros, tipografia, números em mono, preenchimentos chapados. A shell nova —
HUD de 56 px, `[ MENU ]` de seis módulos, ecrãs como janelas sobre a QUEST —
fica para uma segunda fase; até lá a navegação continua a ser a tab bar e a
barra lateral.

Sete pontos voltaram para o desenho em [`PARA-O-DESIGN.md`](PARA-O-DESIGN.md).
O mais sério é o `--color-ink-dim` (`#6e6a62`), que reprova a WCAG AA nos três
fundos do sistema e é usado em corpo de texto.
