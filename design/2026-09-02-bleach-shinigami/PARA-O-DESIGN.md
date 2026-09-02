# O que ficou por resolver — para a revisão 3

Levantado ao **implementar** a revisão 2 do pacote (branch
`design/estetica-bleach`), não ao validá-la. A validação deu tudo confirmado:
as sete correções que o `CORRECOES.md` anuncia estão todas lá, e o README, o
`github.md`, o `tokens.css` e o protótipo descrevem finalmente a mesma app.

O que segue é o que só aparece quando se tenta construir a partir do pacote.
Nada disto impediu implementar — a fase 1 está feita — mas cada um custou uma
decisão que o sistema devia ter tomado por nós, e a decisão acabou tomada no
código em vez de no desenho.

Está por ordem de custo: primeiro o que faz o sistema contradizer-se, depois o
que ele não cobre.

---

## D1 · O `--color-ink-dim` reprova a WCAG e é para corpo de texto

**O mais sério da lista.** O `tokens.css` dá `--color-ink-dim: #6e6a62`, e o
README usa-o em notas, dicas e legendas — ou seja, corpo de texto pequeno, onde
a WCAG AA pede 4,5:1.

| Sobre | Contraste | |
|---|---|---|
| Vazio `#0c0e13` | 3,59:1 | reprova |
| Painel `#15171f` | 3,32:1 | reprova |
| Trilho `#1e212b` | 2,98:1 | reprova |

Não é rigor excessivo: este projeto já tinha levantado o tom equivalente da
geração anterior de `#6f7183` para `#7e8093` exatamente por esta razão, e
adotar o do handoff desfazia essa correção.

**O que fizemos:** `#918b7d` — 5,69 / 5,27 / 4,74:1 sobre os três fundos,
mantendo o tom quente do osso.

**O que pedimos:** que o sistema adote um `ink-dim` que passe, ou que diga
explicitamente que o `#6e6a62` é só para elementos decorativos e nomeie outro
token para texto. Enquanto o sistema disser uma coisa e o código outra, a
próxima pessoa que implementar repõe o valor que reprova.

---

## D2 · O `tokens.css` de movimento não bate certo com o protótipo

O painel «MOVIMENTO» dentro do próprio protótipo declara:

```
flicker 90 ms · glitch 140 ms
boot 220 ms · wipe 260 ms
respiração 2 s
cubic-bezier(.2,.9,.3,1)
```

O `tokens.css` copia fielmente esse painel. O README copia fielmente o código.
Os dois discordam em dois valores:

| Token | `tokens.css` | Animação real | |
|---|---|---|---|
| `--dur-glitch` | 140 ms | `sfix` `.14s` | bate certo |
| `--dur-wipe` | 260 ms | `swipe` `.26s` | bate certo |
| `--dur-boot` | **220 ms** | `sscan` **`.34s`** | 120 ms de diferença |
| `--dur-flicker` | **90 ms** | — | nenhuma animação usa 90 ms |

Os 220 ms existem no protótipo, mas são o `smat` (materializar), não o boot. Ou
o painel troca os nomes, ou tem um número velho do `sscan`.

Ninguém copiou mal — o problema é a especificação estar em dois sítios. Quem
implementar a partir do `tokens.css` fica com o boot 120 ms mais rápido do que
o desenho, e não tem como saber.

**O que pedimos:** que o painel do protótipo e o `tokens.css` saiam de uma
fonte só. E que `--dur-flicker` seja retirado ou ganhe uma animação que o use.

---

## D3 · A lista de constantes a copiar está incompleta

O README diz «constantes no fim do protótipo — copiar tal e qual» e nomeia
treze: `PLANO`, `SEMANA`, `REFEICOES`, `ALIMENTOS`, `RAPIDOS`, `ORDENS_BASE`,
`PATENTES`, `CONQUISTAS`, `COSMETICOS`, `DIVISOES`, `PESAGENS`,
`REIATSU_SEMANA`, `HISTORICO`.

O protótipo declara mais cinco que são conteúdo e não estão na lista:

| Constante | O que é |
|---|---|
| `EQUIPADOS` | os três cosméticos equipados na demonstração |
| `ESCALOES` | Hollow / Adjuchas / Vasto Lorde, cada um com o seu par de cores |
| `NOTAS` | a nota de intenção de cada ecrã (`[ QUEST ]`, `[ DOJO ]`, …) |
| `REF_CURTO` | `P.ALMOÇO` · `ALMOÇO` · `LANCHE` · `JANTAR` |
| `REF_ICONE` | o ícone de cada refeição (`manha`, `meio`, `tarde`, `noite`) |

(`CY`, `CYS`, `INK`, `MUT` e `LINE` também estão fora da lista, mas são apenas
atalhos de cor — esses não fazem falta.)

**O que pedimos:** que a lista passe a ser exaustiva, ou que diga que não é.

---

## D4 · O sprite cobre menos de metade dos ícones da app

O sistema abandonou os SVG de `art/` na interface e passou a um sprite inline
de 30 símbolos. A app usa **58** ícones distintos, e mesmo mapeando com
generosidade (`menu` e `lista` para o mesmo, `manha`/`meio`/`tarde` para o
mesmo) o sprite cobre **26**. Ficam **32 sem correspondência**:

```
AlertTriangle  ArrowLeft      ArrowRight     Award          Brain
CalendarCheck  CalendarDays   Check          CheckCircle2   ChevronDown
ChevronLeft    ChevronRight   Circle         Clock          Footprints
Gift           Hammer         HeartPulse     Info           LineChart
Lock           PartyPopper    Pause          Plus           RefreshCw
Ruler          ScanBarcode    Square         Star           TrendingUp
Trophy         X
```

Não são ícones exóticos: são o `×` de fechar, os chevrons de navegação, o
check de concluído, o cadeado de bloqueado, o `+` de adicionar. Nenhum ecrã
funciona sem eles.

**O que fizemos:** ficámos no lucide e aproximámos pelo traço — 2 px → 1,5 px,
que é a espessura do sprite. Visualmente resolve; o sprite fica por portar.

**O que pedimos:** ou o sprite cresce para cobrir o que a app usa, ou o sistema
diz qual é a família de recurso e com que regras (traço, viewBox, cantos), para
os dois conjuntos não lerem como dois desenhos diferentes.

---

## D5 · A paleta não tem cor de estado

O sistema nomeia o azul de kidō como «confirmação» e o carmim como «HP e
destrutivo». A app precisa de três estados distintos — positivo, aviso e erro —
e o sistema não os separa.

**O que fizemos**, e é a única mudança semântica da migração:

| Estado | Antes | Agora | Porquê |
|---|---|---|---|
| `good` | verde `#3ddc97` | kidō `#4fa3c7` | não há verde na paleta |
| `warn` | `#ff9f1c` | alerta `#d9a635` | é o token de aviso do sistema |
| `bad` | `#ff5468` | carmim claro `#ef4a63` | o `#c8102e` dá 3,28:1, não serve para texto |

Perde-se o verde como sinal de «feito», que é convenção forte. Ganha-se
coerência com o tema. Aceitámos a troca, mas foi decisão nossa e devia ser do
sistema.

**O que pedimos:** que o sistema declare os três estados por nome, e diga
explicitamente que `--color-signal` (`#c8102e`) é só preenchimento — para texto
a variante é `#ef4a63`.

---

## D6 · O chanfro apaga tudo o que sai da caixa, e o sistema não o diz

O sistema pede glow de 14 px e chanfro em quase tudo. As duas coisas juntas não
funcionam: `clip-path` recorta sombras exteriores, bordas nas diagonais e o
contorno de foco.

Encontrámos isto três vezes:

- **Cinco CTA** tinham `box-shadow` projetado e chanfro. A sombra nunca chegou a
  pintar nada — era CSS morto no protótipo também.
- **Os anéis do retrato** e o filete da amostra selecionada usavam `border`.
  Numa forma recortada, a borda desaparece nas duas diagonais.
- **As utilidades de glow** teriam o mesmo destino.

**O que fizemos:** o glow passou a `inset`, que acompanha o recorte; para o que
precisa mesmo de halo exterior criámos uma variante em `drop-shadow`, que segue
a silhueta; e as molduras passaram a ser uma forma pintada com o miolo
recortado 1–2 px por dentro. O protótipo já usa as três técnicas — a do
invólucro de 1 px, aliás, aparece nas janelas e nos modais.

**O que pedimos:** que a secção «Forma» do README diga qual é a técnica para
cada caso. É a regra que mais custa a descobrir sozinho, e a que mais silêncio
produz quando se erra: não há erro, simplesmente não aparece nada.

---

## D7 · Não há especificação para além do telemóvel

O protótipo é 402 × 874 e mais nada. A app corre também em desktop, onde tem
uma barra lateral de 264 px que o desenho não cobre.

**O que fizemos:** mantivemos a barra lateral e repintámo-la com a linguagem do
sistema — navegação em Saira maiúscula, filete de reiatsu no item ativo,
chanfro, barra de patente segmentada.

**O que pedimos:** nada urgente. Mas se o desktop importa, a shell nova (HUD +
`[ MENU ]` + janelas) vai precisar de uma resposta para ecrãs largos antes da
fase 2, e é melhor vir do desenho do que de nós.

---

## Fora de âmbito, e sem pedido

As **13 cores de divisão** (`src/data/divisions.ts`) não estão no sistema — o
`DIVISOES` do protótipo só tem nomes. Deixámo-las como estão: são identidade de
jogo, não cromo de tema, e duas delas coincidem com tokens antigos por acaso.
Se o sistema quiser reclamá-las um dia, é uma conversa à parte.
