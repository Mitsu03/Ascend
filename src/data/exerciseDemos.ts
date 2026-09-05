import type { Exercise } from '@/types'

/**
 * Demonstração de cada exercício: duas fotografias — o início e o fim do
 * movimento — alternadas em ciclo, que é o que mostra o que se mexe.
 *
 * As imagens estão em `public/exercises/<id>-0.jpg` e `-1.jpg`, empacotadas
 * com a app. A alternativa era um leitor de vídeo do YouTube, mas dentro da
 * WKWebView a origem é `https://localhost` e os embeds recusam-se a tocar;
 * além disso obrigava a ter rede — precisamente o que não há na cave de um
 * ginásio.
 *
 * Fonte: free-exercise-db (github.com/yuhonas/free-exercise-db), sob a
 * Unlicense, ou seja domínio público. O valor aqui guardado é o nome do
 * exercício nesse conjunto de dados: não é usado pela UI, serve para se poder
 * confirmar de onde veio cada par de imagens.
 *
 * Cinco exercícios ficaram de fora. Polichinelos, flexões em pique e corrida
 * no lugar porque o conjunto de dados não os tem e os vizinhos ("Star Jump",
 * "Handstand Push-Ups") são outro movimento; a pinça de mão e o balde de arroz
 * porque não existem em conjunto nenhum com licença livre. Mostrar o exercício
 * errado seria pior do que não mostrar nenhum, por isso esses ficam só com a
 * descrição escrita. Os burpees, que também não têm fotografias, ganharam
 * vídeo.
 */
const DEMO_SOURCES: Record<string, string> = {
  'abdominais-bicicleta': 'Air Bike',
  'aberturas-halteres': 'Dumbbell Flyes',
  'afundos': 'Bodyweight Walking Lunge',
  'afundos-halteres': 'Dumbbell Lunges',
  'agachamento-barra': 'Barbell Full Squat',
  'agachamento-bulgaro': 'One Leg Barbell Squat',
  'agachamento-corporal': 'Bodyweight Squat',
  'agachamento-goblet': 'Goblet Squat',
  'agachamento-sumo': 'Plie Dumbbell Squat',
  'bicicleta-estatica': 'Bicycling, Stationary',
  'bom-dia': 'Good Morning',
  'circulos-bracos': 'Arm Circles',
  'coice-gluteo': 'Glute Kickback',
  'coice-gluteo-polia': 'One-Legged Cable Kickback',
  'crucifixo-inverso': 'Reverse Flyes',
  'crunch-com-peso': 'Weighted Crunches',
  'crunch-polia': 'Cable Crunch',
  'cruzamento-polia': 'Cable Crossover',
  'curl-barra': 'Barbell Curl',
  'curl-biceps': 'Dumbbell Bicep Curl',
  'curl-concentrado': 'Concentration Curls',
  'curl-femoral': 'Lying Leg Curls',
  'curl-inverso': 'Reverse Barbell Curl',
  'curl-martelo': 'Hammer Curls',
  'curl-punho': 'Seated Dumbbell Palms-Up Wrist Curl',
  'curl-punho-inverso': 'Seated Dumbbell Palms-Down Wrist Curl',
  'curl-scott': 'Preacher Curl',
  'dips-cadeira': 'Bench Dips',
  'elevacao-panturrilha': 'Standing Calf Raises',
  'elevacao-pernas-suspenso': 'Hanging Leg Raise',
  'elevacoes': 'Pullups',
  'elevacoes-laterais': 'Side Lateral Raise',
  'elevacoes-laterais-polia': 'Cable Seated Lateral Raise',
  'elevacoes-supinadas': 'Chin-Up',
  'encolhimentos': 'Dumbbell Shrug',
  'escalador': 'Mountain Climbers',
  'extensao-pernas': 'Leg Extensions',
  'extensao-pescoco': 'Lying Face Down Plate Neck Resistance',
  'face-pull': 'Face Pull',
  'flexao-inclinada': 'Incline Push-Up',
  'flexao-pescoco': 'Lying Face Up Plate Neck Resistance',
  'flexoes': 'Pushups',
  'flexoes-declinadas': 'Decline Push-Up',
  'flexoes-diamante': 'Push-Ups - Close Triceps Position',
  'gemeos-sentado': 'Seated Calf Raise',
  'hack-squat': 'Hack Squat',
  'hip-thrust': 'Barbell Hip Thrust',
  'leg-press': 'Leg Press',
  'nordic-curl': 'Natural Glute Ham Raise',
  'passadeira-intervalos': 'Running, Treadmill',
  'peck-deck': 'Butterfly',
  'pescoco-isometrico': 'Isometric Neck Exercise - Front And Back',
  'pescoco-lateral': 'Isometric Neck Exercise - Sides',
  'peso-morto': 'Barbell Deadlift',
  'peso-morto-pernas-esticadas': 'Stiff-Legged Barbell Deadlift',
  'peso-morto-romeno-halteres': 'Romanian Deadlift',
  'ponte-gluteos': 'Butt Lift (Bridge)',
  'prancha': 'Plank',
  'prancha-lateral': 'Side Bridge',
  'press-militar': 'Standing Military Press',
  'press-ombros-halteres': 'Dumbbell Shoulder Press',
  'press-peito-chao': 'Dumbbell Floor Press',
  'puxada-frente': 'Wide-Grip Lat Pulldown',
  'remada-alta-halteres': 'Standing Dumbbell Upright Row',
  'remada-curvada': 'Bent Over Barbell Row',
  'remada-invertida': 'Inverted Row',
  'remada-sentada': 'Seated Cable Rows',
  'remada-unilateral': 'One-Arm Dumbbell Row',
  'remo-ergometro': 'Rowing, Stationary',
  'rolo-punho': 'Wrist Roller',
  'russian-twist': 'Russian Twist',
  'superman': 'Superman',
  'supino': 'Barbell Bench Press - Medium Grip',
  'supino-inclinado': 'Barbell Incline Bench Press - Medium Grip',
  'triceps-frances': 'Standing Dumbbell Triceps Extension',
  'triceps-polia': 'Triceps Pushdown',
}

export interface ExerciseDemoFrames {
  /** Início do movimento. */
  start: string
  /** Fim do movimento. */
  end: string
}

export function demoForExercise(exerciseId: Exercise['id']): ExerciseDemoFrames | undefined {
  if (!(exerciseId in DEMO_SOURCES)) return undefined
  return {
    start: `/exercises/${exerciseId}-0.jpg`,
    end: `/exercises/${exerciseId}-1.jpg`,
  }
}

/**
 * Os poucos exercícios com vídeo verdadeiro.
 *
 * Não existe nenhum conjunto de vídeos de exercícios com licença livre que
 * cubra um catálogo inteiro. O Wikimedia Commons tem onze, sete deles de
 * exercícios daqui — mas só quatro têm uma versão em H.264. Os originais são
 * WebM/VP9 e o WebKit do iOS não os descodifica: o `<video>` lê o contentor,
 * fica em `readyState 1` e nunca mostra imagem. Os restantes exercícios ficam
 * com as duas fotografias.
 *
 * As outras hipóteses estão fechadas: o YouTube não toca a partir da origem
 * `https://localhost` da app, e os GIFs da ExerciseDB são de um produto
 * comercial, sem licença para irem num pacote destes.
 *
 * A CC BY obriga a creditar o autor, por isso o crédito aparece por baixo do
 * vídeo na app — tirá-lo é quebrar a licença.
 */
const DEMO_VIDEOS: Record<string, { author: string; license: string }> = {
  supino: { author: 'FitnessScape', license: 'CC BY 3.0' },
  'peso-morto': { author: 'FitnessScape', license: 'CC BY 3.0' },
  'elevacao-pernas-suspenso': { author: 'FitnessScape', license: 'CC BY 3.0' },
  burpees: { author: 'Taco fleur', license: 'CC BY-SA 4.0' },
}

export interface ExerciseVideo {
  src: string
  author: string
  license: string
}

export function videoForExercise(exerciseId: Exercise['id']): ExerciseVideo | undefined {
  const credit = DEMO_VIDEOS[exerciseId]
  if (!credit) return undefined
  return { src: `/exercises/${exerciseId}.mov`, ...credit }
}
