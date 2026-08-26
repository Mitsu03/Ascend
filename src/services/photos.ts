/**
 * Utilitários de imagem para o registo por fotografia.
 *
 * As fotos são guardadas como data URLs no localStorage, por isso são sempre
 * redimensionadas e recomprimidas antes de gravar — uma foto de telemóvel em
 * bruto esgotaria a quota do armazenamento numa mão-cheia de refeições.
 */

/** Lado maior da miniatura guardada, em pixéis. */
const THUMBNAIL_MAX_SIDE = 320
/** Lado maior da imagem enviada para reconhecimento (mais detalhe, não guardada). */
const ANALYSIS_MAX_SIDE = 768

async function loadImage(source: string | Blob): Promise<HTMLImageElement> {
  const url = typeof source === 'string' ? source : URL.createObjectURL(source)
  try {
    return await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image()
      image.onload = () => resolve(image)
      image.onerror = () => reject(new Error('Não foi possível ler a imagem.'))
      image.src = url
    })
  } finally {
    if (typeof source !== 'string') URL.revokeObjectURL(url)
  }
}

function drawScaled(image: HTMLImageElement | HTMLVideoElement, maxSide: number, quality: number): string {
  const width = 'naturalWidth' in image ? image.naturalWidth : image.videoWidth
  const height = 'naturalHeight' in image ? image.naturalHeight : image.videoHeight
  const scale = Math.min(1, maxSide / Math.max(width, height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.max(1, Math.round(width * scale))
  canvas.height = Math.max(1, Math.round(height * scale))
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Canvas indisponível.')
  context.drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', quality)
}

/** Fotograma atual de um <video> como data URL JPEG. */
export function captureFrame(video: HTMLVideoElement): { thumbnail: string; analysis: string } {
  return {
    thumbnail: drawScaled(video, THUMBNAIL_MAX_SIDE, 0.6),
    analysis: drawScaled(video, ANALYSIS_MAX_SIDE, 0.8),
  }
}

/** Converte um ficheiro escolhido pelo utilizador nas duas resoluções. */
export async function fileToImages(file: File): Promise<{ thumbnail: string; analysis: string }> {
  const image = await loadImage(file)
  return {
    thumbnail: drawScaled(image, THUMBNAIL_MAX_SIDE, 0.6),
    analysis: drawScaled(image, ANALYSIS_MAX_SIDE, 0.8),
  }
}

/** Só o payload base64, sem o prefixo `data:image/jpeg;base64,`. */
export function stripDataUrl(dataUrl: string): string {
  const comma = dataUrl.indexOf(',')
  return comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
}

export interface CameraStreamResult {
  stream: MediaStream
  stop: () => void
}

/** Abre a câmara traseira quando existe; devolve também a forma de a fechar. */
export async function openCamera(): Promise<CameraStreamResult> {
  if (!navigator.mediaDevices?.getUserMedia) {
    throw new Error('unsupported')
  }
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 } },
    audio: false,
  })
  return {
    stream,
    stop: () => {
      for (const track of stream.getTracks()) track.stop()
    },
  }
}

export function cameraIsSupported(): boolean {
  return Boolean(navigator.mediaDevices?.getUserMedia)
}
