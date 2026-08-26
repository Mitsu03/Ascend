# Ascend

**Fitness e nutrição gamificados.** Uma aplicação web desktop-first (Windows) com estética anime original, onde o utilizador é o protagonista da sua própria jornada de evolução: treina, regista refeições, completa missões e sobe de nível.

Interface em **português de Portugal**, com **inglês** disponível nas definições. Funciona offline, sem contas, sem subscrições e sem APIs pagas — todos os dados ficam no dispositivo.

> ⚠️ **Aviso:** a Ascend calcula **estimativas** de calorias e macronutrientes para gestão pessoal. Não constitui aconselhamento médico ou nutricional. Em caso de dúvida, consulta um profissional de saúde.

---

## Funcionalidades do MVP

| Área | O que faz |
| --- | --- |
| **Onboarding** | Wizard de 5 passos (nome, objetivo, nível, dias/semana, equipamento, dados corporais). Calcula calorias e macros e gera o plano semanal e as missões. |
| **Base do Herói** (dashboard) | Saudação personalizada, cartão de nível com barra de XP animada, moedas, sequência de dias, calorias vs meta, missões do dia, próximo treino e uma frase narrativa adaptada ao estado do dia. |
| **Treino** | Calendário semanal, detalhe do treino com séries/reps/descanso/dificuldade, sessão guiada com cronómetro, checkboxes por série, temporizador de descanso e barra de progresso. Ecrã de celebração no fim com XP, moedas, atributos e recompensa aleatória. Criador de treinos personalizados. |
| **Nutrição** | Meta diária de calorias, anéis e barras de macros, registo rápido a partir de um catálogo de ~60 alimentos comuns em Portugal, registo por fotografia e código de barras, contador de água e sugestões de refeições com base no que falta para a meta. |
| **Missões** | 3 missões diárias, 2 semanais e 1 desafio especial. Recompensas visíveis antes de concluir (XP, moedas, cosméticos). Cada missão pode ser substituída uma vez por período. |
| **Perfil / Progresso** | Avatar SVG original personalizável, nível e título, atributos (Força, Resistência, Disciplina, Energia), histórico de peso e medidas, gráficos de calorias/treinos/XP, 10 conquistas e inventário cosmético. |

### Registo por fotografia e código de barras

Na página de Nutrição, o botão **Registar por fotografia** abre um modo de captura com dois separadores:

- **Código de barras** — lê o código da embalagem com a câmara (via `BarcodeDetector`, disponível no Chrome, Edge e Android; nos restantes navegadores escreve-se o código à mão) e consulta o [Open Food Facts](https://world.openfoodfacts.org/), uma base de dados pública e gratuita. Os valores nutricionais registados são os reais do produto. É a única funcionalidade da app que precisa de ligação à internet.
- **Fotografia** — tira uma foto ao prato com a câmara ou escolhe uma imagem. A miniatura fica anexada à refeição no diário.

O **reconhecimento automático do prato está desligado por omissão** — não vem com nenhuma chave embutida, porque numa PWA tudo o que está no código é público. Ligas o teu próprio serviço em **Perfil › Definições › Reconhecimento por fotografia**, e há opções **gratuitas**:

| Serviço | Custo | Onde obter a chave |
| --- | --- | --- |
| **Google Gemini** (recomendado) | Nível gratuito com limites diários generosos | [aistudio.google.com/apikey](https://aistudio.google.com/apikey) |
| **OpenRouter** | Modelos terminados em `:free` | [openrouter.ai/models?q=free](https://openrouter.ai/models?q=free) |
| **Groq** | Nível gratuito, limites por minuto mais apertados | [console.groq.com](https://console.groq.com/docs/models) |
| **OpenAI** | Pago por utilização | [platform.openai.com](https://platform.openai.com/api-keys) |

Os três primeiros são gratuitos e todos permitem chamadas diretas a partir do browser (CORS aberto, verificado). Escolhe o serviço no painel, cola a chave e o endpoint e o modelo são preenchidos automaticamente — nos serviços que agregam vários modelos tens de copiar o nome exato de um modelo com visão.

**Sobre a chave:** fica guardada neste browser e é legível por quem tenha acesso ao dispositivo. Por isso a recomendação é um serviço de nível gratuito sem cartão associado — no pior caso gasta-se a quota, não dinheiro.

A app envia a foto, recebe os alimentos e as porções estimadas, e mostra-os para confirmação com as gramas editáveis. As estimativas nunca entram no diário sem passares os olhos por elas. O código está isolado em `src/services/foodVision.ts` e os serviços em `src/services/visionProviders.ts`.

### Idiomas

Português de Portugal é o idioma por omissão. O inglês escolhe-se em **Perfil › Definições › Idioma da aplicação** e aplica-se de imediato — incluindo catálogos de exercícios e alimentos, missões, conquistas, datas e formatação de números. A escolha fica guardada no dispositivo.

Para acrescentar uma língua: `src/i18n/pt.ts` é o dicionário de referência e o tipo `Dictionary` deriva dele, por isso o TypeScript assinala qualquer chave em falta na tradução nova.

### Sistema de gamificação

- **XP e níveis** — curva `XP(n) = 100 × n^1.5`. Ganha-se XP com treinos, missões, metas de proteína e sequências.
- **Atributos** — Força (treinos), Resistência (cardio e duração), Disciplina (missões e sequências), Energia (sono, água, recuperação).
- **Moedas** — apenas cosméticas. Não existe qualquer vantagem comprável.
- **Recompensas aleatórias** — 22% de probabilidade de um cosmético comum/raro após um treino; caso contrário, 15 moedas de compensação. Sem loot boxes nem mecânicas agressivas.
- **Sequências (streaks)** — sem penalizações. Falhar um dia oferece um **Dia de Recuperação** (renovado a cada 7 dias de sequência); ao quebrar, a mensagem é encorajadora e não há perda de XP ou moedas.
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

- **Começar a minha jornada** — onboarding completo com os teus dados reais.
- **Explorar com dados de demonstração** — carrega o perfil fictício **Kai** (nível 7, plano de 4 dias, histórico de 3 semanas, refeições, missões e conquistas parcialmente concluídas) para ver a app imediatamente povoada.

Para voltar ao início: **Perfil → Definições → Repor dados**.

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
│  ├─ HeroAvatar.tsx        # avatar SVG original, desenhado por camadas
│  ├─ layout/AppShell.tsx   # sidebar (desktop) + bottom nav (mobile)
│  └─ ui/                   # Card, Button, Progress, Modal, Toaster, Icon, Misc
├─ data/                    # catálogos locais
│  ├─ exercises.ts          # ~45 exercícios (sem equipamento / halteres / ginásio)
│  ├─ foods.ts              # ~60 alimentos comuns em Portugal
│  ├─ quests.ts             # templates de missões diárias, semanais e especiais
│  ├─ achievements.ts       # as 10 conquistas
│  ├─ cosmetics.ts          # molduras, títulos e auras
│  └─ demoUser.ts           # perfil de demonstração (Kai, nível 7)
├─ features/
│  ├─ start/                # ecrã inicial (demo vs jornada)
│  ├─ onboarding/           # wizard de 5 passos
│  ├─ dashboard/            # Base do Herói
│  ├─ workout/              # plano, sessão, celebração, criador de treinos
│  ├─ nutrition/            # metas, registo, sugestões
│  ├─ quests/               # missões diárias e semanais
│  └─ profile/              # avatar, atributos, gráficos, conquistas, inventário
├─ i18n/                   # dicionários pt/en e o hook useI18n
├─ services/
│  ├─ storage.ts            # adaptador de persistência (ver abaixo)
│  ├─ photos.ts             # câmara, captura e compressão de imagens
│  ├─ openFoodFacts.ts      # consulta de produtos por código de barras
│  ├─ foodVision.ts         # reconhecimento por fotografia (opcional)
│  ├─ calculations.ts       # Mifflin-St Jeor, macros, curva de XP, recompensas
│  ├─ planGenerator.ts      # geração do plano semanal
│  ├─ questGenerator.ts     # geração e substituição de missões
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

## Licença

Projeto pessoal. Todo o conteúdo visual (avatar, ícones de marca, ilustrações) é original — não é utilizado material protegido por direitos de autor de terceiros.
