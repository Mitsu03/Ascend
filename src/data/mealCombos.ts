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
    meals: MANHA_LANCHE,
  },
  {
    foodIds: ['ovos', 'pao-mistura', 'abacate'],
    label: l('Ovos + pão + abacate', 'Eggs + bread + avocado'),
    meals: MANHA,
  },
  {
    foodIds: ['ovo-mexido', 'pao-centeio', 'tomate'],
    label: l('Ovos mexidos em pão de centeio', 'Scrambled eggs on rye bread'),
    meals: MANHA,
  },
  {
    foodIds: ['iogurte-grego', 'granola', 'mirtilos'],
    label: l('Iogurte grego + granola + mirtilos', 'Greek yoghurt + granola + blueberries'),
    meals: MANHA_LANCHE,
  },
  {
    foodIds: ['aveia', 'leite-meio-gordo', 'banana'],
    label: l('Papas de aveia com banana', 'Porridge with banana'),
    meals: MANHA,
  },
  {
    foodIds: ['requeijao', 'tostas-integrais', 'morangos'],
    label: l('Requeijão + tostas + morangos', 'Curd cheese + crispbread + strawberries'),
    meals: MANHA_LANCHE,
  },
  {
    foodIds: ['queijo-fresco', 'pao-integral', 'kiwi'],
    label: l('Queijo fresco em pão integral + kiwi', 'Fresh cheese on wholemeal bread + kiwi'),
    meals: MANHA,
  },
  {
    foodIds: ['muesli', 'iogurte-natural', 'framboesas'],
    label: l('Muesli com iogurte e framboesas', 'Muesli with yoghurt and raspberries'),
    meals: MANHA,
  },
  {
    foodIds: ['claras-ovo', 'aveia', 'maca'],
    label: l('Claras + aveia + maçã', 'Egg whites + oats + apple'),
    meals: MANHA,
  },
  {
    foodIds: ['bebida-soja', 'aveia', 'tamaras'],
    label: l('Aveia com bebida de soja e tâmaras', 'Oats with soy drink and dates'),
    meals: MANHA,
  },
  {
    foodIds: ['tostas-integrais', 'manteiga-amendoim', 'banana'],
    label: l('Tostas com manteiga de amendoim e banana', 'Crispbread with peanut butter and banana'),
    meals: MANHA_LANCHE,
  },

  // -------------------------------------------------------------- Lanche/snack
  {
    foodIds: ['whey', 'leite-meio-gordo'],
    label: l('Batido de proteína com leite', 'Protein shake with milk'),
    meals: LANCHE,
  },
  {
    foodIds: ['amendoas', 'maca'],
    label: l('Maçã com amêndoas', 'Apple with almonds'),
    meals: LANCHE,
  },
  {
    foodIds: ['iogurte-natural', 'nozes', 'pera'],
    label: l('Iogurte com nozes e pera', 'Yoghurt with walnuts and pear'),
    meals: LANCHE,
  },
  {
    foodIds: ['queijo-cottage', 'ananas'],
    label: l('Queijo cottage com ananás', 'Cottage cheese with pineapple'),
    meals: LANCHE,
  },
  {
    foodIds: ['hummus', 'tostas-integrais', 'cenoura'],
    label: l('Hummus com tostas e palitos de cenoura', 'Hummus with crispbread and carrot sticks'),
    meals: LANCHE,
  },
  {
    foodIds: ['tremocos', 'laranja'],
    label: l('Tremoços + laranja', 'Lupin beans + orange'),
    meals: LANCHE,
  },
  {
    foodIds: ['skyr', 'framboesas', 'sementes-chia'],
    label: l('Skyr com framboesas e chia', 'Skyr with raspberries and chia'),
    meals: LANCHE,
  },
  {
    foodIds: ['castanhas', 'tangerina'],
    label: l('Castanhas assadas + tangerina', 'Roast chestnuts + tangerine'),
    meals: LANCHE,
  },
  {
    foodIds: ['barra-proteina'],
    label: l('Barra de proteína', 'Protein bar'),
    meals: LANCHE,
  },
  {
    foodIds: ['atum-lata', 'pao-integral', 'tomate'],
    label: l('Tosta de atum com tomate', 'Tuna and tomato on wholemeal toast'),
    meals: ['lanche', 'almoco'],
  },
  {
    foodIds: ['peru-fatias', 'tortilha-trigo', 'alface'],
    label: l('Wrap de peru com alface', 'Turkey wrap with lettuce'),
    meals: ['lanche', 'almoco'],
  },
  {
    foodIds: ['sopa-legumes', 'pao-integral'],
    label: l('Sopa de legumes + pão', 'Vegetable soup + bread'),
    meals: ['lanche', 'almoco', 'jantar'],
  },

  // ------------------------------------------------------- Almoço e jantar
  {
    foodIds: ['peito-frango', 'arroz-cozido', 'brocolos'],
    label: l('Frango + arroz + brócolos', 'Chicken + rice + broccoli'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['salmao', 'batata-cozida', 'salada-mista'],
    label: l('Salmão + batata + salada', 'Salmon + potato + salad'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['bacalhau-cozido', 'batata-cozida', 'grelos', 'azeite'],
    label: l('Bacalhau com batata, grelos e azeite', 'Salt cod with potato, greens and olive oil'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['dourada', 'arroz-integral', 'espargos'],
    label: l('Dourada + arroz integral + espargos', 'Sea bream + brown rice + asparagus'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['pescada-cozida', 'batata-cozida', 'feijao-verde'],
    label: l('Pescada cozida com batata e feijão-verde', 'Boiled hake with potato and green beans'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['carne-vaca-magra', 'massa-integral', 'tomate'],
    label: l('Vaca magra com massa integral e tomate', 'Lean beef with wholemeal pasta and tomato'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['lombo-porco', 'pure-batata', 'couve-lombarda'],
    label: l('Lombo de porco + puré + couve', 'Pork loin + mash + cabbage'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['tofu', 'quinoa', 'espinafres'],
    label: l('Tofu salteado + quinoa + espinafres', 'Sautéed tofu + quinoa + spinach'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['lentilhas', 'salada-mista', 'azeite'],
    label: l('Lentilhas com salada e fio de azeite', 'Lentils with salad and a drizzle of olive oil'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['grao-de-bico', 'courgette', 'azeite'],
    label: l('Grão salteado com courgette', 'Sautéed chickpeas with courgette'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['batata-doce', 'peito-frango', 'brocolos'],
    label: l('Batata-doce assada + frango + brócolos', 'Baked sweet potato + chicken + broccoli'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['tempeh', 'arroz-integral', 'couve-roxa'],
    label: l('Tempeh + arroz integral + couve roxa', 'Tempeh + brown rice + red cabbage'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['seitan', 'massa-integral', 'cogumelos'],
    label: l('Seitan salteado com massa e cogumelos', 'Sautéed seitan with pasta and mushrooms'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['camarao', 'massa-cozida', 'espargos'],
    label: l('Massa de camarão com espargos', 'Prawn pasta with asparagus'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['polvo', 'batata-assada', 'salada-mista'],
    label: l('Polvo à lagareiro com batata e salada', 'Octopus with roast potato and salad'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['carapau-grelhado', 'batata-cozida', 'pimento-vermelho'],
    label: l('Carapau grelhado com batata e pimento', 'Grilled horse mackerel with potato and pepper'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['sardinha-assada', 'broa-milho', 'pimento-verde'],
    label: l('Sardinha assada com broa e pimento', 'Grilled sardines with cornbread and pepper'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['coxa-frango', 'couscous', 'abobora'],
    label: l('Coxa de frango + couscous + abóbora', 'Chicken thigh + couscous + pumpkin'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['atum-fresco', 'bulgur', 'tomate-cereja'],
    label: l('Atum fresco + bulgur + tomate cereja', 'Fresh tuna + bulgur + cherry tomatoes'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['feijao-preto', 'arroz-cozido', 'couve-galega'],
    label: l('Feijão preto com arroz e couve', 'Black beans with rice and greens'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['ovos', 'batata-assada', 'espinafres'],
    label: l('Ovos com batata assada e espinafres', 'Eggs with roast potato and spinach'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['truta', 'quinoa', 'brocolos'],
    label: l('Truta + quinoa + brócolos', 'Trout + quinoa + broccoli'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['lulas-grelhadas', 'arroz-cozido', 'salada-mista'],
    label: l('Lulas grelhadas com arroz e salada', 'Grilled squid with rice and salad'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['mexilhao', 'massa-cozida', 'tomate'],
    label: l('Mexilhão com massa e tomate', 'Mussels with pasta and tomato'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['borrego', 'batata-assada', 'couve-bruxelas'],
    label: l('Borrego assado com couve-de-bruxelas', 'Roast lamb with brussels sprouts'),
    meals: PRINCIPAIS,
  },
  {
    foodIds: ['cavala', 'broa-milho', 'salada-mista'],
    label: l('Cavala grelhada com broa e salada', 'Grilled mackerel with cornbread and salad'),
    meals: PRINCIPAIS,
  },
]
