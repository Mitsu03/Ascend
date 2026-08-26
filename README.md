# Ascend

**Fitness e nutrição gamificados no universo do Bleach.** Uma aplicação web desktop-first (Windows) onde entras no Gotei 13, escolhes uma das treze divisões e sobes de patente à medida que treinas: ganhas **reiatsu** em vez de XP, gastas **kan** em selos e títulos, cumpres as **ordens da tua divisão** e, a partir de Terceiro Oficial, a **máscara de Hollow** começa a formar-se sobre o teu rosto.

Toda a arte é original ou de terceiros sob licença livre — ver [Arte e licenças](#arte-e-licenças).

Interface em **português de Portugal**, com **inglês** disponível nas definições. Funciona offline, sem contas, sem subscrições e sem APIs pagas — todos os dados ficam no dispositivo.

> ⚠️ **Aviso:** a Ascend calcula **estimativas** de calorias e macronutrientes para gestão pessoal. Não constitui aconselhamento médico ou nutricional. Em caso de dúvida, consulta um profissional de saúde.

---

## Funcionalidades do MVP

| Área | O que faz |
| --- | --- |
| **Academia Shin'ō** (onboarding) | Wizard de 6 passos (nome, objetivo, como treinas, **divisão do Gotei**, dados corporais, juramento). Calcula calorias e macros e gera o plano semanal e as ordens. |
| **Quartel da Divisão** (dashboard) | Saudação personalizada, selo da divisão, cartão de patente com barra de reiatsu animada, kan, dias de serviço, calorias vs meta, ordens do dia, próximo treino e uma frase narrativa adaptada ao estado do dia. |
| **Dojo** (treino) | Calendário semanal, detalhe do treino com séries/reps/descanso/dificuldade, sessão guiada com cronómetro, checkboxes por série, temporizador de descanso e barra de progresso. Ecrã de celebração no fim com reiatsu, kan, artes de combate e recompensa aleatória — e a máscara de Hollow quando sobes de patente. Criador de treinos personalizados. |
| **Rações** (nutrição) | Meta diária de calorias, anéis e barras de macros, registo rápido a partir de um catálogo de ~60 alimentos comuns em Portugal, registo por fotografia e código de barras, contador de água e sugestões de refeições com base no que falta para a meta. |
| **Ordens da Divisão** | 3 ordens diárias, 2 semanais e uma Ordem do Capitão. Recompensas visíveis antes de cumprir (reiatsu, kan, cosméticos). Cada ordem pode ser substituída uma vez por período. |
| **Ficha de Shinigami** (perfil) | Retrato em figura desenhada ou brasão de esquadrão, máscara de Hollow por patente, patente e divisão, as quatro artes de combate (Zanjutsu, Hohō, Kidō, Reiryoku), histórico de peso e medidas, gráficos de calorias/treinos/reiatsu, 10 conquistas e arsenal cosmético. |

### Registo por fotografia e código de barras

Na página de Nutrição, o botão **Registar por fotografia** abre um modo de captura com dois separadores:

- **Código de barras** — lê o código da embalagem com a câmara (via `BarcodeDetector`, disponível no Chrome, Edge e Android; nos restantes navegadores escreve-se o código à mão) e consulta o [Open Food Facts](https://world.openfoodfacts.org/), uma base de dados pública e gratuita. Os valores nutricionais registados são os reais do produto. É a única funcionalidade da app que precisa de ligação à internet.
- **Fotografia** — tira uma foto ao prato com a câmara ou escolhe uma imagem. A miniatura fica anexada à refeição no diário.

O **reconhecimento automático do prato está desligado por omissão** — não vem com nenhuma chave embutida, porque numa PWA tudo o que está no código é público. Ligas o teu próprio serviço em **Shinigami › Definições › Reconhecimento por fotografia**, e há opções **gratuitas**:

| Serviço | Custo | Onde obter a chave |
| --- | --- | --- |
| **Google Gemini** (recomendado) | Nível gratuito com limites diários generosos | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **OpenRouter** | Modelos terminados em `:free` | [openrouter.ai/models?q=free](https://openrouter.ai/models?q=free) |
| **Groq** | Nível gratuito, limites por minuto mais apertados | [console.groq.com](https://console.groq.com/docs/models) |
| **OpenAI** | Pago por utilização | [platform.openai.com](https://platform.openai.com/api-keys) |

Os três primeiros são gratuitos e todos permitem chamadas diretas a partir do browser (CORS aberto, verificado). Escolhe o serviço no painel, cola a chave e o endpoint e o modelo são preenchidos automaticamente — nos serviços que agregam vários modelos tens de copiar o nome exato de um modelo com visão.

**Sobre a chave:** fica guardada neste browser e é legível por quem tenha acesso ao dispositivo. Por isso a recomendação é um serviço de nível gratuito sem cartão associado — no pior caso gasta-se a quota, não dinheiro.

A app envia a foto, recebe os alimentos e as porções estimadas, e mostra-os para confirmação com as gramas editáveis. As estimativas nunca entram no diário sem passares os olhos por elas. O código está isolado em `src/services/foodVision.ts` e os serviços em `src/services/visionProviders.ts`.

### O Gotei 13

**As treze divisões.** No onboarding escolhes uma divisão — a sugerida vem do teu objetivo, mas podes ficar com qualquer uma e pedir transferência a qualquer momento na ficha. A divisão dá-te um emblema, uma cor de reiatsu e um lema, e aparece como selo na barra lateral, na ficha e no cabeçalho móvel. É puramente estética: não altera cálculos, plano nem metas.

**As patentes.** O que era "nível" é agora a carreira de um Shinigami:

| Nível | Patente |
| --- | --- |
| 1 | Alma de Rukongai |
| 3 | Aluno da Academia Shin'ō |
| 5 | Shinigami sem Patente |
| 7 | Oficial de Divisão |
| 10 | Terceiro Oficial |
| 14 | Tenente |
| 18 | Capitão |
| 25 | Capitão-Comandante |

**A máscara de Hollow.** Desenhada de raiz em SVG (`src/components/art/HollowMask.tsx`), assenta sobre o rosto do avatar e tem três estados ligados à patente: **a formar-se** (10), **rachada** (14) e **inteira** (18). Podes escondê-la a qualquer momento na ficha. A mesma máscara é o logótipo da aplicação, o ícone PWA e o favicon.

**As quatro artes de combate.** Os atributos passaram a ser as disciplinas do Gotei: **Zanjutsu** (lâmina — treinos de força), **Hohō** (passo rápido — cardio e sessões longas), **Kidō** (feitiço — ordens e dias de serviço) e **Reiryoku** (poder espiritual — sono, água e recuperação).

**Retrato ou brasão.** O avatar tem dois modos: a figura desenhada (shihakushō de lapelas cruzadas, zanpakutō embainhada às costas, oito penteados e oito cores) ou um brasão de esquadrão — um de 28 emblemas agrupados em Hollow, Shinigami, Quincy e Espíritos, dentro do anel da tua divisão. Em alternativa podes carregar um retrato teu nas Definições.

### Idiomas

Português de Portugal é o idioma por omissão. O inglês escolhe-se em **Shinigami › Definições › Idioma da aplicação** e aplica-se de imediato — incluindo catálogos de exercícios e alimentos, ordens, conquistas, datas e formatação de números. A escolha fica guardada no dispositivo.

Para acrescentar uma língua: `src/i18n/pt.ts` é o dicionário de referência e o tipo `Dictionary` deriva dele, por isso o TypeScript assinala qualquer chave em falta na tradução nova.

### Sistema de gamificação

- **Reiatsu e patentes** — curva `reiatsu(n) = 100 × n^1.5`. Ganha-se reiatsu com treinos, ordens, metas de proteína e dias de serviço.
- **Artes de combate** — Zanjutsu (treinos de força), Hohō (cardio e duração), Kidō (ordens e dias de serviço), Reiryoku (sono, água, recuperação).
- **Kan** — a moeda da Soul Society, apenas cosmética. Não existe qualquer vantagem comprável.
- **Escalões dos cosméticos** — seguem a evolução dos Hollow: **Hollow**, **Adjuchas** e **Vasto Lorde**.
- **Recompensas aleatórias** — 22% de probabilidade de um cosmético Hollow/Adjuchas após um treino; caso contrário, 15 kan de compensação. Sem loot boxes nem mecânicas agressivas.
- **Dias de serviço (streaks)** — sem penalizações. Falhar um dia oferece uma **Licença** (renovada a cada 7 dias de serviço); ao quebrar, a mensagem é encorajadora e não há perda de reiatsu ou kan.
- **10 conquistas** com ícone, descrição, progresso visível e recompensa.

---

## Como executar

Requisitos: **Node.js 20+** (testado com 24) e npm.

```bash
npm install
npm run dev          # servidor de desenvolvimento em http://localhost:5173
```

Outros comandos:

```bash
npm run build        # verificação de tipos + build de produção para dist/
npm run preview      # serve o build de produção localmente
npm run lint         # oxlint
```

### Instalar como aplicação no Windows

A Ascend é uma PWA. Depois de `npm run build && npm run preview` (ou em produção), abre a app no Chrome ou Edge e usa **⋮ → Instalar Ascend**. Fica com janela própria, ícone no menu Iniciar e funciona offline.

### Primeira utilização

No ecrã inicial há duas opções:

- **Entrar na Academia Shin'ō** — onboarding completo com os teus dados reais.
- **Explorar com dados de demonstração** — carrega a ficha fictícia do **Kai** (Décima Primeira Divisão, patente 7, plano de 4 dias, histórico de 3 semanas, refeições, ordens e conquistas parcialmente concluídas) para ver a app imediatamente povoada.

Para voltar ao início: **Shinigami → Definições → Repor dados**.

---

## Stack

- **React 19** + **TypeScript** + **Vite**
- **Tailwind CSS v4** (tokens de design em `@theme`, sem ficheiro de configuração)
- **zustand** com middleware `persist` para estado e persistência
- **react-router-dom** para navegação
- **recharts** para gráficos (carregado em chunk separado)
- **BarcodeDetector** nativo e **Open Food Facts** para códigos de barras (sem dependências nem chaves)
- **lucide-react** para ícones
- **vite-plugin-pwa** para o manifesto e service worker

Sem backend e sem autenticação. A única chamada de rede é a consulta de códigos de barras ao Open Food Facts, e o reconhecimento por fotografia quando o ligas tu.

---

## Estrutura do projeto

```
src/
├─ components/
│  ├─ HeroAvatar.tsx        # avatar SVG original: shihakushō, zanpakutō, máscara
│  ├─ DivisionSeal.tsx      # selo da divisão (emblema + anel + numeral)
│  ├─ ArtIcon.tsx           # emblema de game-icons.net colorido pelo tema
│  ├─ art/HollowMask.tsx    # a máscara de Hollow, desenhada de raiz
│  ├─ art/SpiritArt.tsx     # céu, cortes de lâmina, partículas, tinta
│  ├─ layout/AppShell.tsx   # sidebar (desktop) + bottom nav (mobile)
│  └─ ui/                   # Card, Button, Progress, Modal, Toaster, Icon, Misc
├─ data/                    # catálogos locais
│  ├─ exercises.ts          # ~45 exercícios (sem equipamento / halteres / ginásio)
│  ├─ foods.ts              # ~60 alimentos comuns em Portugal
│  ├─ quests.ts             # templates de ordens diárias, semanais e do capitão
│  ├─ achievements.ts       # as 10 conquistas, com emblema
│  ├─ cosmetics.ts          # selos, títulos e reiatsu
│  ├─ divisions.ts          # as treze divisões do Gotei 13
│  ├─ avatarEmblems.ts      # os 28 emblemas do modo brasão
│  ├─ artIcons.ts           # GERADO — 91 emblemas de game-icons.net
│  └─ demoUser.ts           # perfil de demonstração (Kai, patente 7)
├─ features/
│  ├─ start/                # ecrã inicial (demo vs jornada)
│  ├─ onboarding/           # wizard de 6 passos, com a escolha da divisão
│  ├─ dashboard/            # Quartel da Divisão
│  ├─ workout/              # plano, sessão, celebração, criador de treinos
│  ├─ nutrition/            # metas, registo, sugestões
│  ├─ quests/               # ordens diárias, semanais e do capitão
│  └─ profile/              # avatar, atributos, gráficos, conquistas, inventário
├─ i18n/                   # dicionários pt/en e o hook useI18n
├─ services/
│  ├─ storage.ts            # adaptador de persistência (ver abaixo)
│  ├─ photos.ts             # câmara, captura e compressão de imagens
│  ├─ openFoodFacts.ts      # consulta de produtos por código de barras
│  ├─ foodVision.ts         # reconhecimento por fotografia (opcional)
│  ├─ calculations.ts       # Mifflin-St Jeor, macros, curva de reiatsu, patentes, máscara
│  ├─ planGenerator.ts      # geração do plano semanal
│  ├─ questGenerator.ts     # geração e substituição de ordens
│  ├─ suggestions.ts        # sugestões de refeições por macros em falta
│  ├─ narrative.ts          # frases do dia
│  ├─ session.ts            # orquestração entre stores (arranque, reset, demo)
│  └─ dates.ts              # utilitários de data em pt-PT
├─ store/                   # zustand: user, game, workout, nutrition, quest, body, toast
└─ types/                   # modelo de domínio
```

### Camada de dados preparada para a cloud

Toda a persistência passa por `StorageAdapter` em `src/services/storage.ts`:

```ts
export interface StorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  keys(): string[]
}
```

No MVP existe apenas `localStorageAdapter`. Para migrar para **Supabase** ou **Firebase** basta implementar um adaptador equivalente (assíncrono) e passá-lo a `createPersistStorage()` — as stores e os componentes não precisam de mudar.

---

## Como são calculadas as estimativas

1. **Metabolismo basal (BMR)** — equação de Mifflin-St Jeor.
2. **Gasto diário (TDEE)** — BMR × fator de atividade derivado dos dias de treino por semana (1,375 a 1,65).
3. **Ajuste por objetivo** — −15% para perder gordura, +10% para ganhar massa, 0% para manter/condição física, com um piso de segurança calórico.
4. **Macros** — proteína 1,6–2,0 g/kg conforme o objetivo; gordura 25% das calorias (mínimo 0,8 g/kg); hidratos com o restante.

Os valores nutricionais do catálogo são aproximados. Consulta sempre o rótulo do produto para valores exatos.

---

## Roadmap (fora do MVP)

- Reconhecimento de pratos offline, com um modelo a correr no próprio dispositivo
- Componente social: amigos, ligas e desafios entre utilizadores
- Mensagens e notificações push
- Sincronização na cloud e conta de utilizador
- Integração com wearables (passos, frequência cardíaca, sono automáticos)
- Pagamentos e conteúdos premium
- Aplicação iOS nativa (a arquitetura atual já separa domínio, serviços e UI para facilitar o porte)

---

## Arte e licenças

**Emblemas.** Os 91 emblemas em `public/art/game-icons/` são de [game-icons.net](https://game-icons.net), por Lorc, Delapouite e DarkZaitzev, usados sob [CC BY 3.0](https://creativecommons.org/licenses/by/3.0/). A atribuição completa, ficheiro a ficheiro, está em [`public/art/LICENSE.md`](public/art/LICENSE.md).

`src/data/artIcons.ts` é **gerado** a partir desses SVG, com duas alterações mecânicas sobre o original: remoção do retângulo de fundo opaco e substituição da cor fixa `#fff` por `currentColor`, para os emblemas herdarem a cor do tema.

**Ilustrações.** O avatar, a máscara de Hollow, os selos das divisões, o céu de crepúsculo, os cortes de lâmina, as partículas de reiatsu, o favicon e os ícones PWA são desenhados de raiz para este projeto, em SVG por código.

**Tipografia.** Inter e Rajdhani, ambas sob [SIL OFL 1.1](https://openfontlicense.org), carregadas do Google Fonts.

**Sobre o Bleach.** A aplicação usa o vocabulário do universo do *Bleach* — Shinigami, zanpakutō, Hollow, reiatsu, bankai, o Gotei 13 e as suas divisões — como tema de um projeto pessoal. **Não contém nem redistribui qualquer arte, texto ou material protegido de *Bleach*.** *Bleach* é criação de Tite Kubo, publicada pela Shueisha; este projeto não tem qualquer ligação a nenhum deles.

## Licença

Projeto pessoal, sem fins comerciais.
