import { localized as l } from '@/i18n/types'
import type { ArtIconName } from '@/data/artIcons'
import type { Localized } from '@/i18n/types'

/**
 * Emblemas disponíveis para o avatar em modo brasão.
 *
 * A alternativa ao retrato desenhado: em vez de uma figura, o utilizador
 * escolhe uma silhueta de game-icons.net (CC BY 3.0) que fica dentro do selo
 * da divisão, ao jeito de um brasão de esquadrão.
 */

export interface AvatarEmblem {
  id: ArtIconName
  name: Localized
  /** Agrupamento apresentado no seletor. */
  family: 'hollow' | 'shinigami' | 'quincy' | 'espirito'
}

export const AVATAR_EMBLEMS: AvatarEmblem[] = [
  // Hollow — máscaras e ossos
  { id: 'hollow-mask', name: l('Máscara de Hollow', 'Hollow Mask'), family: 'hollow' },
  { id: 'cracked-mask', name: l('Máscara Rachada', 'Cracked Mask'), family: 'hollow' },
  { id: 'fanged-skull', name: l('Presas do Vazio', 'Fangs of the Void'), family: 'hollow' },
  { id: 'horned-skull', name: l('Máscara Cornuda', 'Horned Mask'), family: 'hollow' },
  { id: 'daemon-skull', name: l('Adjuchas', 'Adjuchas'), family: 'hollow' },
  { id: 'duality-mask', name: l('Shinigami e Hollow', 'Shinigami and Hollow'), family: 'hollow' },
  { id: 'steel-claws', name: l('Garra de Arrancar', 'Arrancar Claw'), family: 'hollow' },
  { id: 'midnight-claw', name: l('Garra da Meia-Noite', 'Midnight Claw'), family: 'hollow' },

  // Shinigami — lâminas, trajes e patentes
  { id: 'katana', name: l('Zanpakutō', 'Zanpakutō'), family: 'shinigami' },
  { id: 'crossed-swords', name: l('Lâminas Cruzadas', 'Crossed Blades'), family: 'shinigami' },
  { id: 'sword-array', name: l('Mil Pétalas', 'Thousand Petals'), family: 'shinigami' },
  { id: 'energy-sword', name: l('Zanpakutō Liberto', 'Released Zanpakutō'), family: 'shinigami' },
  { id: 'samurai-helmet', name: l('Elmo do Gotei', 'Gotei Helm'), family: 'shinigami' },
  { id: 'hooded-figure', name: l('Onmitsukidō', 'Onmitsukidō'), family: 'shinigami' },
  { id: 'grim-reaper', name: l('Ceifeiro de Almas', 'Soul Reaper'), family: 'shinigami' },
  { id: 'winged-sword', name: l('Bankai', 'Bankai'), family: 'shinigami' },

  // Quincy — cruzes e arcos de reishi
  { id: 'cross-flare', name: l('Cruz Quincy', 'Quincy Cross'), family: 'quincy' },
  { id: 'lightning-bow', name: l('Arco de Reishi', 'Reishi Bow'), family: 'quincy' },
  { id: 'gothic-cross', name: l('Cruz de Prata', 'Silver Cross'), family: 'quincy' },
  { id: 'winged-arrow', name: l('Flecha Espiritual', 'Spirit Arrow'), family: 'quincy' },

  // Espíritos — almas, borboletas e auras
  { id: 'hell-butterfly', name: l('Borboleta do Inferno', 'Hell Butterfly'), family: 'espirito' },
  { id: 'soul', name: l('Alma', 'Soul'), family: 'espirito' },
  { id: 'chain-of-fate', name: l('Corrente do Destino', 'Chain of Fate'), family: 'espirito' },
  { id: 'ghost', name: l('Plus', 'Plus'), family: 'espirito' },
  { id: 'aura', name: l('Reiatsu', 'Reiatsu'), family: 'espirito' },
  { id: 'moon', name: l('Lua Cortante', 'Cutting Moon'), family: 'espirito' },
  { id: 'angel-wings', name: l('Asas de Reishi', 'Reishi Wings'), family: 'espirito' },
  { id: 'third-eye', name: l('Olho Espiritual', 'Spirit Eye'), family: 'espirito' },
]

export const EMBLEM_FAMILY_ORDER: AvatarEmblem['family'][] = ['hollow', 'shinigami', 'quincy', 'espirito']

export const AVATAR_EMBLEM_BY_ID: Record<string, AvatarEmblem> = Object.fromEntries(
  AVATAR_EMBLEMS.map((emblem) => [emblem.id, emblem]),
)
