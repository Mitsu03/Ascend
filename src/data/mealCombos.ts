import { localized as l } from '@/i18n/types'
import type { Localized } from '@/i18n/types'
import type { MealType } from '@/types'

/**
 * Combinações escritas à mão. Servem de âncora de qualidade ao gerador
 * automático: pratos que uma pessoa reconhece como refeição, não apenas
 * como uma soma de macros que bate certo.
 */

export type ComboFocus = 'proteina' | 'hidratos' | 'gordura' | 'equilibrado'

export interface CuratedCombo {
  foodIds: string[]
  label: Localized
  focus: ComboFocus
  meals: MealType[]
}

const MANHA: MealType[] = ['pequeno_almoco']
const MANHA_LANCHE: MealType[] = ['pequeno_almoco', 'lanche']
const LANCHE: MealType[] = ['lanche', 'snack']
const PRINCIPAIS: MealType[] = ['almoco', 'jantar']

export const CURATED_COMBOS: CuratedCombo[] = [
  // ------------------------------------------------------------ Pequeno-almoço
  {
    foodIds: ['skyr', 'aveia', 'banana'],
    label: l('Iogurte skyr + aveia + banana', 'Skyr yoghurt + oats + banana'),
    focus: 'proteina',
    meals: MANHA_LANCHE,
  },
  {
    foodIds: ['ovos', 'pao-mistura', 'abacate'],
    label: l('Ovos + pão + abacate', 'Eggs + bread + avocado'),
    focus: 'gordura',
    meals: MANHA,
  },
  {
    foodIds: ['ovo-mexido', 'pao-centeio', 'tomate'],
    label: l('Ovos mexidos em pão de centeio', 'Scrambled eggs on rye bread'),
    focus: 'proteina',
    meals: MANHA,
  },
  {
    foodIds: ['iogurte-grego', 'granola', 'mirtilos'],
    label: l('Iogurte grego + granola + mirtilos', 'Greek yoghurt + granola + blueberries'),
    focus: 'equilibrado',
    meals: MANHA_LANCHE,
  },
  {
    foodIds: ['aveia', 'leite-meio-gordo', 'banana'],
    label: l('Papas de aveia com banana', 'Porridge with banana'),
    focus: 'hidratos',
    meals: MANHA,
  },
  {
    foodIds: ['requeijao', 'tostas-integrais', 'morangos'],
    label: l('Requeijão + tostas + morangos', 'Curd cheese + crispbread + strawberries'),
    focus: 'hidratos',
    meals: MANHA_LANCHE,
  },
  {
    foodIds: ['queijo-fresco', 'pao-integral', 'kiwi'],
    label: l('Queijo fresco em pão integral + kiwi', 'Fresh cheese on wholemeal bread + kiwi'),
    focus: 'proteina',
    meals: MANHA,
  },
  {
    foodIds: ['muesli', 'iogurte-natural', 'framboesas'],
    label: l('Muesli com iogurte e framboesas', 'Muesli with yoghurt and raspberries'),
    focus: 'hidratos',
    meals: MANHA,
  },
  {
    foodIds: ['claras-ovo', 'aveia', 'maca'],
    label: l('Claras + aveia + maçã', 'Egg whites + oats + apple'),
    focus: 'proteina',
    meals: MANHA,
  },
  {
    foodIds: ['bebida-soja', 'aveia', 'tamaras'],
    label: l('Aveia com bebida de soja e tâmaras', 'Oats with soy drink and dates'),
    focus: 'hidratos',
    meals: MANHA,
  },
  {
    foodIds: ['tostas-integrais', 'manteiga-amendoim', 'banana'],
    label: l('Tostas com manteiga de amendoim e banana', 'Crispbread with peanut butter and banana'),
    focus: 'gordura',
    meals: MANHA_LANCHE,
  },

  // -------------------------------------------------------------- Lanche/snack
  {
    foodIds: ['whey', 'leite-meio-gordo'],
    label: l('Batido de proteína com leite', 'Protein shake with milk'),
    focus: 'proteina',
    meals: LANCHE,
  },
  {
    foodIds: ['amendoas', 'maca'],
    label: l('Maçã com amêndoas', 'Apple with almonds'),
    focus: 'gordura',
    meals: LANCHE,
  },
  {
    foodIds: ['iogurte-natural', 'nozes', 'pera'],
    label: l('Iogurte com nozes e pera', 'Yoghurt with walnuts and pear'),
    focus: 'gordura',
    meals: LANCHE,
  },
  {
    foodIds: ['queijo-cottage', 'ananas'],
    label: l('Queijo cottage com ananás', 'Cottage cheese with pineapple'),
    focus: 'proteina',
    meals: LANCHE,
  },
  {
    foodIds: ['hummus', 'tostas-integrais', 'cenoura'],
    label: l('Hummus com tostas e palitos de cenoura', 'Hummus with crispbread and carrot sticks'),
    focus: 'equilibrado',
    meals: LANCHE,
  },
  {
    foodIds: ['tremocos', 'laranja'],
    label: l('Tremoços + laranja', 'Lupin beans + orange'),
    focus: 'proteina',
    meals: LANCHE,
  },
  {
    foodIds: ['skyr', 'framboesas', 'sementes-chia'],
    label: l('Skyr com framboesas e chia', 'Skyr with raspberries and chia'),
    focus: 'proteina',
    meals: LANCHE,
  },
  {
    foodIds: ['castanhas', 'tangerina'],
    label: l('Castanhas assadas + tangerina', 'Roast chestnuts + tangerine'),
    focus: 'hidratos',
    meals: LANCHE,
  },
  {
    foodIds: ['barra-proteina'],
    label: l('Barra de proteína', 'Protein bar'),
    focus: 'proteina',
    meals: LANCHE,
  },
  {
    foodIds: ['atum-lata', 'pao-integral', 'tomate'],
    label: l('Tosta de atum com tomate', 'Tuna and tomato on wholemeal toast'),
    focus: 'proteina',
    meals: ['lanche', 'almoco'],
  },
  {
    foodIds: ['peru-fatias', 'tortilha-trigo', 'alface'],
    label: l('Wrap de peru com alface', 'Turkey wrap with lettuce'),
    focus: 'proteina',
    meals: ['lanche', 'almoco'],
  },
  {
    foodIds: ['sopa-legumes', 'pao-integral'],
    label: l('Sopa de legumes + pão', 'Vegetable soup + bread'),
    focus: 'hidratos',
    meals: ['lanche', 'almoco', 'jantar'],
  },

  // ------------------------------------------------------- Almoço e jantar
  {
    foodIds: ['peito-frango', 'arroz-cozido', 'brocolos'],
    label: l('Frango + arroz + brócolos', 'Chicken + rice + broccoli'),
    focus: 'equilibrado',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['salmao', 'batata-cozida', 'salada-mista'],
    label: l('Salmão + batata + salada', 'Salmon + potato + salad'),
    focus: 'gordura',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['bacalhau-cozido', 'batata-cozida', 'grelos', 'azeite'],
    label: l('Bacalhau com batata, grelos e azeite', 'Salt cod with potato, greens and olive oil'),
    focus: 'equilibrado',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['dourada', 'arroz-integral', 'espargos'],
    label: l('Dourada + arroz integral + espargos', 'Sea bream + brown rice + asparagus'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['pescada-cozida', 'batata-cozida', 'feijao-verde'],
    label: l('Pescada cozida com batata e feijão-verde', 'Boiled hake with potato and green beans'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['carne-vaca-magra', 'massa-integral', 'tomate'],
    label: l('Vaca magra com massa integral e tomate', 'Lean beef with wholemeal pasta and tomato'),
    focus: 'equilibrado',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['lombo-porco', 'pure-batata', 'couve-lombarda'],
    label: l('Lombo de porco + puré + couve', 'Pork loin + mash + cabbage'),
    focus: 'equilibrado',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['tofu', 'quinoa', 'espinafres'],
    label: l('Tofu salteado + quinoa + espinafres', 'Sautéed tofu + quinoa + spinach'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['lentilhas', 'salada-mista', 'azeite'],
    label: l('Lentilhas com salada e fio de azeite', 'Lentils with salad and a drizzle of olive oil'),
    focus: 'equilibrado',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['grao-de-bico', 'courgette', 'azeite'],
    label: l('Grão salteado com courgette', 'Sautéed chickpeas with courgette'),
    focus: 'equilibrado',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['batata-doce', 'peito-frango', 'brocolos'],
    label: l('Batata-doce assada + frango + brócolos', 'Baked sweet potato + chicken + broccoli'),
    focus: 'hidratos',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['tempeh', 'arroz-integral', 'couve-roxa'],
    label: l('Tempeh + arroz integral + couve roxa', 'Tempeh + brown rice + red cabbage'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['seitan', 'massa-integral', 'cogumelos'],
    label: l('Seitan salteado com massa e cogumelos', 'Sautéed seitan with pasta and mushrooms'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['camarao', 'massa-cozida', 'espargos'],
    label: l('Massa de camarão com espargos', 'Prawn pasta with asparagus'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['polvo', 'batata-assada', 'salada-mista'],
    label: l('Polvo à lagareiro com batata e salada', 'Octopus with roast potato and salad'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['carapau-grelhado', 'batata-cozida', 'pimento-vermelho'],
    label: l('Carapau grelhado com batata e pimento', 'Grilled horse mackerel with potato and pepper'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['sardinha-assada', 'broa-milho', 'pimento-verde'],
    label: l('Sardinha assada com broa e pimento', 'Grilled sardines with cornbread and pepper'),
    focus: 'gordura',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['coxa-frango', 'couscous', 'abobora'],
    label: l('Coxa de frango + couscous + abóbora', 'Chicken thigh + couscous + pumpkin'),
    focus: 'equilibrado',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['atum-fresco', 'bulgur', 'tomate-cereja'],
    label: l('Atum fresco + bulgur + tomate cereja', 'Fresh tuna + bulgur + cherry tomatoes'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['feijao-preto', 'arroz-cozido', 'couve-galega'],
    label: l('Feijão preto com arroz e couve', 'Black beans with rice and greens'),
    focus: 'hidratos',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['ovos', 'batata-assada', 'espinafres'],
    label: l('Ovos com batata assada e espinafres', 'Eggs with roast potato and spinach'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['truta', 'quinoa', 'brocolos'],
    label: l('Truta + quinoa + brócolos', 'Trout + quinoa + broccoli'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['lulas-grelhadas', 'arroz-cozido', 'salada-mista'],
    label: l('Lulas grelhadas com arroz e salada', 'Grilled squid with rice and salad'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['mexilhao', 'massa-cozida', 'tomate'],
    label: l('Mexilhão com massa e tomate', 'Mussels with pasta and tomato'),
    focus: 'proteina',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['borrego', 'batata-assada', 'couve-bruxelas'],
    label: l('Borrego assado com couve-de-bruxelas', 'Roast lamb with brussels sprouts'),
    focus: 'gordura',
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['cavala', 'broa-milho', 'salada-mista'],
    label: l('Cavala grelhada com broa e salada', 'Grilled mackerel with cornbread and salad'),
    focus: 'gordura',
    meals: PRINCIPAIS,
  },
]
