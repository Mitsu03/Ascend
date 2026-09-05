import { FOODS } from '@/data/foods'
import type { Food, MealType } from '@/types'

/**
 * Papéis e adequação por refeição, para o gerador de sugestões.
 *
 * A categoria do catálogo não chega: `vegetais` inclui ervas e especiarias,
 * `gordura` inclui óleos que ninguém come à colher e `snack` é quase todo
 * guloseima. Aqui separa-se o que pode entrar numa combinação montada
 * automaticamente do que só faz sentido escrito à mão.
 */

export type ComboRole = 'proteina' | 'lacticinio' | 'hidrato' | 'vegetal' | 'gordura' | 'fruta'

export const COMBO_ROLES: ComboRole[] = [
  'proteina',
  'lacticinio',
  'hidrato',
  'vegetal',
  'gordura',
  'fruta',
]

const ALL_MEALS: MealType[] = ['pequeno_almoco', 'almoco', 'lanche', 'jantar', 'snack']
const MAIN_MEALS: MealType[] = ['almoco', 'jantar']
const LIGHT_MEALS: MealType[] = ['pequeno_almoco', 'lanche', 'snack']

/**
 * Nunca entram numa combinação gerada. Bebidas simples, álcool, doces,
 * temperos, óleos, enchidos e pratos compostos — todos legítimos no diário,
 * nenhum deles algo que a app deva propor sozinha.
 */
const EXCLUDED = new Set([
  // Bebidas sem papel nutricional numa refeição montada
  'cafe', 'cha', 'agua', 'sumo-laranja', 'sumo-maca',
  'refrigerante-cola', 'refrigerante-zero', 'cerveja', 'vinho-tinto', 'vinho-branco',
  // Ervas, especiarias e aromáticos — não são uma porção
  'salsa', 'coentros', 'manjericao', 'hortela', 'gengibre', 'oregaos',
  'pimenta-preta', 'colorau', 'canela', 'alho', 'cebola', 'limao',
  // Óleos e gorduras de barrar — entram como fio de azeite nos combos curados
  'azeite', 'oleo-girassol', 'oleo-coco', 'manteiga', 'margarina', 'maionese', 'natas',
  // Doces e condimentos
  'chocolate-negro', 'chocolate-leite', 'bolachas-maria', 'bolachas-agua-sal',
  'batatas-fritas-pacote', 'pipocas', 'gelado-baunilha', 'mel', 'acucar',
  'compota', 'croissant', 'pasteis-nata', 'mostarda', 'ketchup', 'barra-proteina',
  // Enchidos e fritos
  'bacon', 'chourico', 'alheira', 'presunto', 'batata-frita', 'frango-assado-pele',
  // Pratos compostos: já são a refeição inteira
  'pizza', 'francesinha', 'feijoada', 'bacalhau-bras', 'caldo-verde',
  // Ingrediente isolado, não uma porção
  'gema-ovo',
  // Duplicam as versões cozinhadas e ficam mal num prato quente
  'courgette-crua', 'espinafres-crus',
])

/** Leites e bebidas vegetais entram como lacticínio, não como bebida solta. */
const MILKS = new Set([
  'leite-meio-gordo', 'leite-gordo', 'leite-magro',
  'bebida-soja', 'bebida-amendoa', 'bebida-aveia',
])

/** Refeições em que cada alimento faz sentido, quando difere do papel. */
const MEAL_OVERRIDES: Record<string, MealType[]> = {
  // Proteínas leves, que também servem fora das refeições principais
  whey: LIGHT_MEALS,
  tremocos: ['lanche', 'snack'],
  edamame: ['lanche', 'snack'],
  ovos: ['pequeno_almoco', 'lanche', 'almoco', 'jantar'],
  'ovo-mexido': ['pequeno_almoco', 'lanche', 'almoco', 'jantar'],
  'ovo-estrelado': ['pequeno_almoco', 'lanche', 'almoco', 'jantar'],
  'claras-ovo': ['pequeno_almoco', 'lanche', 'almoco', 'jantar'],
  'peru-fatias': ALL_MEALS,
  fiambre: ALL_MEALS,
  'atum-lata': ALL_MEALS,

  // Hidratos de pequeno-almoço e lanche
  aveia: ['pequeno_almoco', 'lanche'],
  granola: ['pequeno_almoco', 'lanche'],
  muesli: ['pequeno_almoco', 'lanche'],
  'flocos-milho': ['pequeno_almoco', 'lanche'],
  'pao-mistura': LIGHT_MEALS,
  'pao-integral': LIGHT_MEALS,
  'pao-centeio': LIGHT_MEALS,
  'pao-forma-branco': LIGHT_MEALS,
  'papo-seco': LIGHT_MEALS,
  'broa-milho': LIGHT_MEALS,
  'tostas-integrais': LIGHT_MEALS,
  'tortilha-trigo': LIGHT_MEALS,
  hummus: ['lanche', 'snack'],
  castanhas: ['lanche', 'snack'],

  // Gorduras que também acompanham um prato
  abacate: ALL_MEALS,
  'azeitonas-verdes': ALL_MEALS,
  'azeitonas-pretas': ALL_MEALS,
  'sementes-abobora': ALL_MEALS,
  'sementes-girassol': ALL_MEALS,
  'sementes-sesamo': ALL_MEALS,

  // Queijos de prato
  'queijo-mozzarella': ALL_MEALS,
  'queijo-parmesao': ALL_MEALS,
}

const ROLE_BY_CATEGORY: Partial<Record<Food['category'], ComboRole>> = {
  proteina: 'proteina',
  lacticinios: 'lacticinio',
  hidratos: 'hidrato',
  vegetais: 'vegetal',
  gordura: 'gordura',
  fruta: 'fruta',
}

const DEFAULT_MEALS: Record<ComboRole, MealType[]> = {
  proteina: MAIN_MEALS,
  lacticinio: LIGHT_MEALS,
  hidrato: MAIN_MEALS,
  vegetal: MAIN_MEALS,
  gordura: LIGHT_MEALS,
  fruta: LIGHT_MEALS,
}

function roleFor(food: Food): ComboRole | null {
  if (EXCLUDED.has(food.id)) return null
  if (food.category === 'bebida') return MILKS.has(food.id) ? 'lacticinio' : null
  // A sopa de legumes conta como o vegetal do prato.
  if (food.id === 'sopa-legumes') return 'vegetal'
  return ROLE_BY_CATEGORY[food.category] ?? null
}

/**
 * Um prato não mistura cereais de pequeno-almoço com proteína salgada. A
 * pontuação por macros não sabe isto — atum com granola bate certo nas contas
 * e é intragável —, por isso a regra fica explícita.
 */
export type Pairing = 'doce' | 'salgado' | 'neutro'

const DOCE = new Set([
  // Cereais de pequeno-almoço
  'aveia', 'granola', 'muesli', 'flocos-milho',
  // Lacticínios e bebidas doces
  'skyr', 'iogurte-natural', 'iogurte-grego', 'requeijao', 'queijo-cottage',
  'queijo-fresco', 'queijo-creme', 'leite-meio-gordo', 'leite-gordo', 'leite-magro',
  'bebida-soja', 'bebida-amendoa', 'bebida-aveia',
])

const SALGADO_EXTRA = new Set([
  'hummus', 'azeitonas-verdes', 'azeitonas-pretas', 'queijo-mozzarella', 'queijo-parmesao',
])

function pairingFor(food: Food, role: ComboRole): Pairing {
  if (DOCE.has(food.id)) return 'doce'
  if (SALGADO_EXTRA.has(food.id)) return 'salgado'
  // A whey vai para batidos, não para um prato salgado.
  if (role === 'proteina') return food.id === 'whey' ? 'doce' : 'salgado'
  if (role === 'vegetal') return 'salgado'
  return 'neutro'
}

/** Combinações que juntem doce com salgado não são propostas. */
export function pairingsAgree(pairings: Pairing[]): boolean {
  return !(pairings.includes('doce') && pairings.includes('salgado'))
}

export interface RoledFood {
  food: Food
  role: ComboRole
  meals: MealType[]
  pairing: Pairing
}

/** Alimentos elegíveis para combinações geradas, indexados por papel. */
export const FOODS_BY_ROLE: Record<ComboRole, RoledFood[]> = (() => {
  const index = Object.fromEntries(COMBO_ROLES.map((role) => [role, [] as RoledFood[]])) as Record<
    ComboRole,
    RoledFood[]
  >
  for (const food of FOODS) {
    const role = roleFor(food)
    if (!role) continue
    index[role].push({
      food,
      role,
      meals: MEAL_OVERRIDES[food.id] ?? DEFAULT_MEALS[role],
      pairing: pairingFor(food, role),
    })
  }
  return index
})()

export function candidatesFor(role: ComboRole, meal: MealType): RoledFood[] {
  return FOODS_BY_ROLE[role].filter((item) => item.meals.includes(meal))
}
