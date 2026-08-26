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
 */

export type ArtSlot = 'start' | 'dashboard' | 'avatar'

export const ART_SLOTS: ArtSlot[] = ['start', 'dashboard', 'avatar']

/** Nome base procurado em `public/assets/` para cada slot. */
const STATIC_BASENAME: Record<ArtSlot, string> = {
  start: 'backdrop-start',
  dashboard: 'backdrop-dashboard',
  avatar: 'avatar',
}

const STATIC_EXTENSIONS = ['webp', 'jpg', 'jpeg', 'png']

/** Lado maior depois de recomprimir, por slot. Fundos precisam de mais detalhe. */
const MAX_SIDE: Record<ArtSlot, number> = {
  start: 1400,
  dashboard: 1400,
  avatar: 512,
}

const QUALITY: Record<ArtSlot, number> = {
  start: 0.72,
  dashboard: 0.72,
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
  for (const extension of STATIC_EXTENSIONS) {
    const url = `${import.meta.env.BASE_URL}assets/${STATIC_BASENAME[slot]}.${extension}`
    try {
      await loadImageElement(url)
      return url
    } catch {
      /* extensão seguinte */
    }
  }
  return null
}
