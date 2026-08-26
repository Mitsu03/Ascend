import type { PersistStorage, StorageValue } from 'zustand/middleware'

/**
 * Camada de persistência.
 *
 * Toda a escrita/leitura de dados passa por um `StorageAdapter`. No MVP existe
 * apenas o adaptador de `localStorage`, mas a interface foi desenhada para que
 * um adaptador remoto (Supabase / Firebase) possa substituí-lo sem tocar nas
 * stores — ver `docs` no README.
 */
export interface StorageAdapter {
  get<T>(key: string): T | null
  set<T>(key: string, value: T): void
  remove(key: string): void
  keys(): string[]
}

export const STORAGE_PREFIX = 'ascend:'

const memoryFallback = new Map<string, string>()

function readRaw(key: string): string | null {
  try {
    return window.localStorage.getItem(key)
  } catch {
    return memoryFallback.get(key) ?? null
  }
}

function writeRaw(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value)
  } catch {
    memoryFallback.set(key, value)
  }
}

function removeRaw(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    memoryFallback.delete(key)
  }
}

export const localStorageAdapter: StorageAdapter = {
  get<T>(key: string): T | null {
    const raw = readRaw(STORAGE_PREFIX + key)
    if (raw === null) return null
    try {
      return JSON.parse(raw) as T
    } catch {
      return null
    }
  },
  set<T>(key: string, value: T): void {
    try {
      writeRaw(STORAGE_PREFIX + key, JSON.stringify(value))
    } catch {
      /* quota cheia ou valor não serializável — ignorado de propósito */
    }
  },
  remove(key: string): void {
    removeRaw(STORAGE_PREFIX + key)
  },
  keys(): string[] {
    try {
      return Object.keys(window.localStorage)
        .filter((k) => k.startsWith(STORAGE_PREFIX))
        .map((k) => k.slice(STORAGE_PREFIX.length))
    } catch {
      return [...memoryFallback.keys()].map((k) => k.slice(STORAGE_PREFIX.length))
    }
  },
}

/** Adapta um `StorageAdapter` ao formato esperado pelo middleware `persist`. */
export function createPersistStorage<T>(adapter: StorageAdapter = localStorageAdapter): PersistStorage<T> {
  return {
    getItem: (name) => adapter.get<StorageValue<T>>(name),
    setItem: (name, value) => adapter.set(name, value),
    removeItem: (name) => adapter.remove(name),
  }
}

/** Apaga todos os dados da Ascend guardados localmente. */
export function wipeAllData(adapter: StorageAdapter = localStorageAdapter): void {
  for (const key of adapter.keys()) adapter.remove(key)
}
