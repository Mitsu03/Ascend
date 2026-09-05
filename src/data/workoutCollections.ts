import { localized as l } from '@/i18n/types'
import type { CollectionDay, WorkoutCollection, WorkoutExercise } from '@/types'

/**
 * Coleções de treinos: planos semanais inteiros, prontos a aplicar.
 *
 * A diferença para o plano do utilizador é que uma coleção não tem lugar na
 * semana. Os dias trazem um dia sugerido, usado quando a coleção é aplicada de
 * uma vez, mas cada dia pode ser levado sozinho para o dia da semana que se
 * quiser — que é a razão de existirem `CollectionDay` e `WorkoutDay` separados.
 *
 * O catálogo é imutável: aplicar uma coleção copia os dias para o plano, nunca
 * os liga. Mexer no treino depois de aplicado não altera a coleção.
 */

/** Atalho para não repetir a mesma linha setenta vezes. */
function e(exerciseId: string, sets: number, reps: string, restSeconds: number): WorkoutExercise {
  return { exerciseId, sets, reps, restSeconds }
}

function day(
  id: string,
  suggestedDayOfWeek: number,
  name: [string, string],
  focus: [string, string],
  exercises: WorkoutExercise[],
): CollectionDay {
  return {
    id,
    suggestedDayOfWeek,
    name: l(name[0], name[1]),
    focus: l(focus[0], focus[1]),
    exercises,
  }
}

/**
 * «Bodybuilding simplified», a folha de referência do bodybuildingsimplified.com.
 *
 * A folha não é um plano: é uma tabela de volume semanal por músculo (peito
 * 12-20 séries, costas 12-24, ombros 15-21, pescoço 18+…) com as categorias de
 * exercício que a preenchem. O que está aqui é essa tabela transformada num
 * empurrar/puxar/pernas de seis dias, com o volume de cada músculo a cair
 * dentro do intervalo que a folha pede — está tudo contado nas notas.
 *
 * As faixas de repetições seguem as cores da folha: azul (compostos) 5-15,
 * verde (isolamento) 12-30.
 */
const BODYBUILDING_SIMPLIFIED: WorkoutCollection = {
  id: 'bodybuilding-simplified',
  name: l('Bodybuilding simplificado', 'Bodybuilding simplified'),
  tagline: l('Empurrar · puxar · pernas, seis dias', 'Push · pull · legs, six days'),
  description: l(
    'A folha de referência do bodybuildingsimplified.com posta em prática: seis dias que cobrem os doze grupos musculares da tabela, incluindo pescoço e antebraços, com o volume semanal de cada um dentro do intervalo recomendado.',
    'The bodybuildingsimplified.com cheat sheet put to work: six days covering the twelve muscle groups on the table, neck and forearms included, with each one landing inside its recommended weekly set range.',
  ),
  source: l('bodybuildingsimplified.com', 'bodybuildingsimplified.com'),
  difficulty: 'intermedio',
  equipment: 'ginasio',
  notes: [
    l(
      'Volume semanal: peito 16 séries (12-20), costas 22 (12-24), ombros 21 (15-21), bíceps 12 (12-20), tríceps 11 (9-15), quadríceps 14 (12-18), isquiotibiais 12 (12), glúteos 7 (6-12), gémeos 8 (6+), abdominais 6 (6-12), antebraços 6 (6+), pescoço 18 (18+).',
      'Weekly volume: chest 16 sets (12-20), back 22 (12-24), shoulders 21 (15-21), biceps 12 (12-20), triceps 11 (9-15), quads 14 (12-18), hamstrings 12 (12), glutes 7 (6-12), calves 8 (6+), abs 6 (6-12), forearms 6 (6+), neck 18 (18+).',
    ),
    l(
      'Compostos entre 5 e 15 repetições, isolamento entre 12 e 30 — as duas faixas de cor da folha.',
      'Compounds run 5-15 reps and isolation 12-30 — the two colour bands on the sheet.',
    ),
    l(
      'O pescoço fecha quatro dos seis dias e é o que pede mais séries de todos. Se for a primeira vez, começa com metade da carga e sobe daí.',
      'Neck work closes four of the six days and asks for more sets than anything else. If it is new to you, start at half the load and build from there.',
    ),
  ],
  days: [
    day('bbs-empurrar-a', 1, ['Empurrar A', 'Push A'], ['Peito, ombros e tríceps', 'Chest, shoulders and triceps'], [
      e('supino', 4, '6-10', 150),
      e('supino-inclinado', 3, '8-12', 120),
      e('peck-deck', 3, '12-20', 60),
      e('press-militar', 4, '6-10', 120),
      e('elevacoes-laterais', 3, '12-20', 60),
      e('triceps-polia', 4, '12-20', 60),
      e('pescoco-isometrico', 4, '20-30 s', 30),
    ]),
    day('bbs-puxar-a', 2, ['Puxar A', 'Pull A'], ['Costas, bíceps e antebraço', 'Back, biceps and forearms'], [
      e('elevacoes', 4, '6-10', 150),
      e('remada-curvada', 4, '6-10', 120),
      e('puxada-frente', 3, '10-15', 90),
      e('face-pull', 3, '15-25', 60),
      e('curl-barra', 3, '8-12', 75),
      e('curl-martelo', 3, '12-20', 60),
      e('curl-punho', 3, '12-20', 45),
    ]),
    day('bbs-pernas-a', 3, ['Pernas A', 'Legs A'], ['Quadríceps, posterior e gémeos', 'Quads, posterior chain and calves'], [
      e('agachamento-barra', 4, '5-10', 180),
      e('peso-morto-romeno-halteres', 4, '8-12', 120),
      e('leg-press', 3, '10-15', 120),
      e('curl-femoral', 4, '12-20', 60),
      e('elevacao-panturrilha', 4, '10-20', 60),
      e('crunch-polia', 3, '12-20', 60),
      e('flexao-pescoco', 5, '12-20', 45),
    ]),
    day('bbs-empurrar-b', 4, ['Empurrar B', 'Push B'], ['Volume no peito e no tríceps', 'Chest and triceps volume'], [
      e('flexoes-declinadas', 3, '10-20', 90),
      e('cruzamento-polia', 3, '12-20', 60),
      e('press-ombros-halteres', 4, '8-12', 120),
      e('elevacoes-laterais-polia', 4, '12-20', 60),
      e('triceps-frances', 4, '10-15', 75),
      e('dips-cadeira', 3, '10-20', 60),
      e('elevacao-pernas-suspenso', 3, '10-20', 60),
    ]),
    day('bbs-puxar-b', 5, ['Puxar B', 'Pull B'], ['Dorsais, pico do bíceps e pescoço', 'Lats, biceps peak and neck'], [
      e('elevacoes-supinadas', 4, '6-10', 150),
      e('remada-sentada', 4, '8-12', 105),
      e('remada-unilateral', 3, '10-15', 90),
      e('crucifixo-inverso', 3, '15-20', 60),
      e('curl-scott', 3, '8-12', 75),
      e('curl-inverso', 3, '12-20', 60),
      e('extensao-pescoco', 5, '12-20', 45),
    ]),
    day('bbs-pernas-b', 6, ['Pernas B', 'Legs B'], ['Glúteos, isquiotibiais e gémeos', 'Glutes, hamstrings and calves'], [
      e('hack-squat', 4, '8-12', 150),
      e('hip-thrust', 4, '8-12', 120),
      e('peso-morto-pernas-esticadas', 4, '8-12', 120),
      e('extensao-pernas', 3, '12-20', 60),
      e('gemeos-sentado', 4, '12-25', 45),
      e('coice-gluteo-polia', 3, '12-20', 45),
      e('curl-punho-inverso', 3, '12-20', 45),
      e('pescoco-lateral', 4, '12-20', 30),
    ]),
  ],
}

export const WORKOUT_COLLECTIONS: WorkoutCollection[] = [BODYBUILDING_SIMPLIFIED]

export function getCollection(id: string): WorkoutCollection | undefined {
  return WORKOUT_COLLECTIONS.find((collection) => collection.id === id)
}
