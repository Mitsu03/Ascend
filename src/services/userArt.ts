/**
 * Imagens escolhidas pelo utilizador para personalizar a aplicação.
 *
 * Há duas vias, e a app usa a primeira que encontrar:
 *
 * 1. **Carregadas na aplicação** — ficam guardadas neste dispositivo e são
 *    editáveis a partir das Definições. É a via recomendada.
 * 2. **Ficheiros em `public/assets/`** — para quem prefere fixar as imagens no
 *    projeto. A pasta está no `.gitignore`, por isso o conteúdo não é publicado.
 *
 * Sem nenhuma das duas, a app usa as suas ilustrações originais.
 *
 * São dois slots: `app` é o fundo único dos cinco ecrãs de dentro da aplicação
 * (Quartel, Dojo, Rações, Ordens, Shinigami) e `avatar` é o retrato. Houve
 * antes um slot por ecrã de entrada (`start`) e um só do Quartel (`dashboard`);
 * ambos deram lugar a este fundo único — ver a migração em `artStore`, e os
 * nomes antigos que `STATIC_BASENAME` continua a aceitar.
 */

export type ArtSlot = 'app' | 'avatar'

export const ART_SLOTS: ArtSlot[] = ['app', 'avatar']

/**
 * Nomes base procurados em `public/assets/`, por ordem, para cada slot. Os
 * `backdrop-dashboard` e `backdrop-start` são os nomes da versão anterior:
 * continuam a ser lidos para quem já tem lá o ficheiro, mas `backdrop` é o
 * nome a usar de hoje em diante.
 */
const STATIC_BASENAME: Record<ArtSlot, string[]> = {
  app: ['backdrop', 'backdrop-dashboard', 'backdrop-start'],
  avatar: ['avatar'],
}

const STATIC_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png']

/** Lado maior depois de recomprimir, por slot. Fundos precisam de mais detalhe. */
const MAX_SIDE: Record<ArtSlot, number> = {
  app: 1400,
  avatar: 512,
}

const QUALITY: Record<ArtSlot, number> = {
  app: 0.72,
  avatar: 0.82,
}

export class ArtTooLargeError extends Error {}

function loadImageElement(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('unreadable'))
    image.src = url
  })
}

/** Redimensiona e recomprime a imagem para caber no armazenamento local. */
export async function prepareArt(file: File, slot: ArtSlot): Promise<string> {
  const url = URL.createObjectURL(file)
  try {
    const image = await loadImageElement(url)
    const maxSide = MAX_SIDE[slot]
    const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale))
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale))
    const context = canvas.getContext('2d')
    if (!context) throw new Error('canvas indisponível')
    context.drawImage(image, 0, 0, canvas.width, canvas.height)

    const dataUrl = canvas.toDataURL('image/jpeg', QUALITY[slot])
    // ~1,4 MB de data URL ocupa perto de metade da quota típica do localStorage.
    if (dataUrl.length > 1_400_000) throw new ArtTooLargeError(slot)
    return dataUrl
  } finally {
    URL.revokeObjectURL(url)
  }
}

/**
 * Procura um ficheiro estático em `public/assets/` para o slot indicado.
 * Devolve null quando não existe nenhum — o caso normal.
 */
export async function findStaticArt(slot: ArtSlot): Promise<string | null> {
  for (const basename of STATIC_BASENAME[slot]) {
    for (const extension of STATIC_EXTENSIONS) {
      const url = `${import.meta.env.BASE_URL}assets/${basename}.${extension}`
      try {
        await loadImageElement(url)
        return url
      } catch {
        /* extensão seguinte */
      }
    }
  }
  return null
}
