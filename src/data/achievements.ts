import { localized as l } from '@/i18n/types'
import type { Achievement } from '@/types'

/**
 * As 10 conquistas iniciais da Ascend, com os marcos da carreira de um
 * Shinigami. Cada uma tem um emblema de game-icons.net (CC BY 3.0) — ver
 * `public/art/LICENSE.md` — e mantém um ícone lucide de reserva para os
 * sítios onde só cabe um traço fino.
 */
export const ACHIEVEMENTS: Achievement[] = [
  {
    id: 'primeiro-passo',
    title: l('Primeiro Corte', 'First Cut'),
    description: l(
      'Completa o teu primeiro treino. Toda a lâmina começa por um golpe.',
      'Complete your first session. Every blade starts with one cut.',
    ),
    icon: 'Footprints',
    emblem: 'quick-slash',
    target: 1,
    metric: 'workouts',
    rewardXp: 50,
    rewardCoins: 20,
  },
  {
    id: 'chama-acesa',
    title: l('Reiatsu Desperto', 'Reiatsu Awakened'),
    description: l('Mantém três dias de serviço seguidos.', 'Keep three consecutive days of service.'),
    icon: 'Flame',
    emblem: 'spark-spirit',
    target: 3,
    metric: 'streak',
    rewardXp: 60,
    rewardCoins: 25,
  },
  {
    id: 'semana-de-ferro',
    title: l('Semana no Seireitei', 'A Week in the Seireitei'),
    description: l(
      'Sete dias de serviço consecutivos. A disciplina passou a hábito.',
      'Seven consecutive days of service. Discipline has become habit.',
    ),
    icon: 'CalendarCheck',
    emblem: 'shinto-shrine',
    target: 7,
    metric: 'streak',
    rewardXp: 120,
    rewardCoins: 50,
  },
  {
    id: 'guerreiro-dedicado',
    title: l('Décima Primeira Divisão', 'Eleventh Division'),
    description: l('Completa 10 treinos. Sem kidō, sem desculpas.', 'Complete 10 sessions. No kidō, no excuses.'),
    icon: 'Dumbbell',
    emblem: 'crossed-swords',
    target: 10,
    metric: 'workouts',
    rewardXp: 130,
    rewardCoins: 55,
  },
  {
    id: 'mestre-proteina',
    title: l('Rações do Gotei', 'Gotei Rations'),
    description: l(
      'Atinge a meta diária de proteína em 5 dias.',
      'Hit your daily protein target on 5 days.',
    ),
    icon: 'Beef',
    emblem: 'soul-vessel',
    target: 5,
    metric: 'proteinDays',
    rewardXp: 110,
    rewardCoins: 45,
  },
  {
    id: 'ascensao',
    title: l('Máscara de Hollow', 'Hollow Mask'),
    description: l(
      'Chega à patente de Terceiro Oficial — a máscara começa a formar-se sobre o teu rosto.',
      'Reach Third Seat — the mask starts to form over your face.',
    ),
    icon: 'TrendingUp',
    emblem: 'hollow-mask',
    target: 10,
    metric: 'level',
    rewardXp: 200,
    rewardCoins: 100,
  },
  {
    id: 'cacador-missoes',
    title: l('Borboleta do Inferno', 'Hell Butterfly'),
    description: l('Cumpre 20 ordens da divisão.', 'Carry out 20 division orders.'),
    icon: 'Target',
    emblem: 'hell-butterfly',
    target: 20,
    metric: 'quests',
    rewardXp: 150,
    rewardCoins: 60,
  },
  {
    id: 'chef-heroi',
    title: l('Cozinha da Quarta', 'Kitchen of the Fourth'),
    description: l(
      'Regista 50 refeições no diário alimentar.',
      'Log 50 meals in your food diary.',
    ),
    icon: 'UtensilsCrossed',
    emblem: 'kimono',
    target: 50,
    metric: 'meals',
    rewardXp: 140,
    rewardCoins: 55,
  },
  {
    id: 'arquiteto',
    title: l('Forja da Asauchi', 'Asauchi Forge'),
    description: l(
      'Cria o teu primeiro treino personalizado — a tua lâmina, feita à tua medida.',
      'Create your first custom session — your own blade, made to fit.',
    ),
    icon: 'Hammer',
    emblem: 'sword-hilt',
    target: 1,
    metric: 'customWorkouts',
    rewardXp: 80,
    rewardCoins: 30,
  },
  {
    id: 'observador',
    title: l('Instituto de Investigação', 'Research Institute'),
    description: l(
      'Regista 5 pesagens. A Décima Segunda Divisão aprova.',
      'Log 5 weigh-ins. The Twelfth Division approves.',
    ),
    icon: 'LineChart',
    emblem: 'third-eye',
    target: 5,
    metric: 'weightLogs',
    rewardXp: 90,
    rewardCoins: 35,
  },
]

export function getAchievement(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((achievement) => achievement.id === id)
}
