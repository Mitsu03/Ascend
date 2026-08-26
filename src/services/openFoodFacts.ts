import { localized } from '@/i18n/types'
import type { Food } from '@/types'

/**
 * Consulta de produtos embalados por código de barras no Open Food Facts.
 *
 * É a única chamada de rede da app e é opcional: serve apenas o leitor de
 * código de barras. A API é pública, gratuita e não exige chave.
 */

const ENDPOINT = 'https://world.openfoodfacts.org/api/v2/product'
const FIELDS = 'product_name,product_name_pt,brands,nutriments,serving_quantity,quantity'

interface OffNutriments {
  'energy-kcal_100g'?: number
  'energy_100g'?: number
  proteins_100g?: number
  carbohydrates_100g?: number
  fat_100g?: number
}

interface OffProduct {
  product_name?: string
  product_name_pt?: string
  brands?: string
  nutriments?: OffNutriments
  serving_quantity?: number | string
}

interface OffResponse {
  status?: number
  product?: OffProduct
}

export interface BarcodeLookup {
  /** Alimento pronto a registar, com id sintético prefixado por `off:`. */
  food: Food
  brand?: string
}

/** Aceita apenas dígitos, no formato EAN-8/12/13/14. */
export function isValidBarcode(code: string): boolean {
  return /^\d{8,14}$/.test(code.trim())
}

function toNumber(value: number | string | undefined): number | undefined {
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined
  if (typeof value === 'string') {
    const parsed = Number.parseFloat(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  return undefined
}

export class BarcodeNotFoundError extends Error {}
export class BarcodeIncompleteError extends Error {}

/**
 * Devolve um `Food` sintético para o código indicado.
 * Lança `BarcodeNotFoundError` se o produto não existir e
 * `BarcodeIncompleteError` se não tiver valores nutricionais utilizáveis.
 */
export async function lookupBarcode(code: string, signal?: AbortSignal): Promise<BarcodeLookup> {
  const trimmed = code.trim()
  const response = await fetch(`${ENDPOINT}/${encodeURIComponent(trimmed)}.json?fields=${FIELDS}`, {
    signal,
    headers: { Accept: 'application/json' },
  })
  if (!response.ok) throw new BarcodeNotFoundError(trimmed)

  const body = (await response.json()) as OffResponse
  if (body.status !== 1 || !body.product) throw new BarcodeNotFoundError(trimmed)

  const product = body.product
  const nutriments = product.nutriments ?? {}
  // Alguns produtos só trazem energia em kJ.
  const kcal =
    toNumber(nutriments['energy-kcal_100g']) ??
    (toNumber(nutriments['energy_100g']) !== undefined
      ? Math.round((toNumber(nutriments['energy_100g']) as number) / 4.184)
      : undefined)

  const proteinG = toNumber(nutriments.proteins_100g)
  const carbsG = toNumber(nutriments.carbohydrates_100g)
  const fatG = toNumber(nutriments.fat_100g)

  if (kcal === undefined || proteinG === undefined || carbsG === undefined || fatG === undefined) {
    throw new BarcodeIncompleteError(trimmed)
  }

  const name = product.product_name_pt?.trim() || product.product_name?.trim() || trimmed
  const portion = toNumber(product.serving_quantity) ?? 100

  return {
    brand: product.brands?.split(',')[0]?.trim() || undefined,
    food: {
      id: `off:${trimmed}`,
      name: localized(name, name),
      category: 'refeicao',
      per100g: {
        calories: Math.round(kcal),
        proteinG: Math.round(proteinG * 10) / 10,
        carbsG: Math.round(carbsG * 10) / 10,
        fatG: Math.round(fatG * 10) / 10,
      },
      commonPortionG: Math.max(10, Math.round(portion)),
      portionLabel: localized(`${Math.round(portion)} g`, `${Math.round(portion)} g`),
      diets: [],
    },
  }
}

interface DetectedBarcode {
  rawValue: string
}

interface BarcodeDetectorLike {
  detect: (source: CanvasImageSource) => Promise<DetectedBarcode[]>
}

interface BarcodeDetectorConstructor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike
  getSupportedFormats?: () => Promise<string[]>
}

function getDetectorConstructor(): BarcodeDetectorConstructor | undefined {
  return (window as unknown as { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector
}

/** O leitor automático exige a API BarcodeDetector (Chrome, Edge, Android). */
export function barcodeScanningIsSupported(): boolean {
  return getDetectorConstructor() !== undefined
}

export function createBarcodeDetector(): BarcodeDetectorLike | null {
  const Detector = getDetectorConstructor()
  if (!Detector) return null
  return new Detector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128'] })
}
