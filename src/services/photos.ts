import { Camera, CameraDirection, CameraResultType, CameraSource } from '@capacitor/camera'
import { isNative } from '@/lib/native'

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

/** Uma imagem qualquer nas duas resoluções: a que se guarda e a que se analisa. */
async function toImages(source: string | Blob): Promise<{ thumbnail: string; analysis: string }> {
  const image = await loadImage(source)
  return {
    thumbnail: drawScaled(image, THUMBNAIL_MAX_SIDE, 0.6),
    analysis: drawScaled(image, ANALYSIS_MAX_SIDE, 0.8),
  }
}

/** Converte um ficheiro escolhido pelo utilizador nas duas resoluções. */
export async function fileToImages(file: File): Promise<{ thumbnail: string; analysis: string }> {
  return toImages(file)
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
  if (isNative) return true
  return Boolean(navigator.mediaDevices?.getUserMedia)
}

/**
 * Fotografia tirada com a câmara nativa, no wrapper iOS/Android.
 *
 * A pré-visualização por `getUserMedia` dentro de um `<video>` não serve aqui:
 * a WKWebView serve a app a partir de um handler de esquema próprio, e nesse
 * contexto o WebKit devolve a stream com a track de vídeo silenciada — o
 * elemento fica preto. A câmara do sistema resolve isso e ainda dá melhor
 * qualidade do que a captura por canvas.
 *
 * Devolve `null` quando o utilizador fecha a câmara sem tirar a foto.
 */
export async function captureWithNativeCamera(): Promise<{ thumbnail: string; analysis: string } | null> {
  return getNativePhoto(CameraSource.Camera)
}

/**
 * Fotografia escolhida na galeria do sistema, no wrapper iOS/Android.
 *
 * Um `<input type="file">` também chega à galeria, mas no iOS abre primeiro um
 * menu com «Biblioteca / Tirar foto / Escolher ficheiro» — um passo a mais, e
 * uma das opções repete o botão da câmara que está mesmo ao lado.
 *
 * Devolve `null` quando o utilizador fecha o seletor sem escolher nada.
 */
export async function pickFromNativeGallery(): Promise<{ thumbnail: string; analysis: string } | null> {
  return getNativePhoto(CameraSource.Photos)
}

async function getNativePhoto(
  source: CameraSource,
): Promise<{ thumbnail: string; analysis: string } | null> {
  let photo
  try {
    photo = await Camera.getPhoto({
      source,
      direction: CameraDirection.Rear,
      resultType: CameraResultType.DataUrl,
      correctOrientation: true,
      allowEditing: false,
      quality: 85,
      width: ANALYSIS_MAX_SIDE,
    })
  } catch (cause) {
    if (isCancellation(cause)) return null
    throw cause
  }

  if (!photo.dataUrl) throw new Error('A câmara não devolveu imagem.')
  return toImages(photo.dataUrl)
}

/** O plugin sinaliza o cancelamento como erro; distingui-lo evita falso alarme. */
function isCancellation(cause: unknown): boolean {
  const message = cause instanceof Error ? cause.message : String(cause)
  return /cancel/i.test(message)
}
