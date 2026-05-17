import { vi } from 'vitest'

const localStorage = new Map<string, unknown>()
const sessionStorage = new Map<string, unknown>()

function createStorageArea(store: Map<string, unknown>) {
  return {
    get: vi.fn(async (keys?: string | string[] | Record<string, unknown>) => {
      if (!keys) {
        const result: Record<string, unknown> = {}
        store.forEach((v, k) => {
          result[k] = v
        })
        return result
      }
      if (typeof keys === 'string') {
        return { [keys]: store.get(keys) }
      }
      if (Array.isArray(keys)) {
        const result: Record<string, unknown> = {}
        keys.forEach(k => {
          result[k] = store.get(k)
        })
        return result
      }
      // Object with defaults
      const result: Record<string, unknown> = {}
      for (const [k, def] of Object.entries(keys)) {
        result[k] = store.has(k) ? store.get(k) : def
      }
      return result
    }),
    set: vi.fn(async (items: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(items)) {
        store.set(k, v)
      }
    }),
    remove: vi.fn(async (keys: string | string[]) => {
      const arr = Array.isArray(keys) ? keys : [keys]
      arr.forEach(k => {
        store.delete(k)
      })
    }),
    clear: vi.fn(async () => {
      store.clear()
    }),
  }
}

type MessageListener = (
  message: unknown,
  sender: unknown,
  sendResponse: (response?: unknown) => void
) => void

type InstalledListener = (details: { reason: string }) => void

const messageListeners: MessageListener[] = []
const installedListeners: InstalledListener[] = []

export const chromeMock = {
  storage: {
    local: createStorageArea(localStorage),
    session: createStorageArea(sessionStorage),
  },
  runtime: {
    sendMessage: vi.fn(),
    onMessage: {
      addListener: vi.fn((listener: MessageListener) => {
        messageListeners.push(listener)
      }),
      removeListener: vi.fn((listener: MessageListener) => {
        const idx = messageListeners.indexOf(listener)
        if (idx >= 0) messageListeners.splice(idx, 1)
      }),
      hasListener: vi.fn((listener: MessageListener) =>
        messageListeners.includes(listener)
      ),
    },
    onInstalled: {
      addListener: vi.fn((listener: InstalledListener) => {
        installedListeners.push(listener)
      }),
      removeListener: vi.fn((listener: InstalledListener) => {
        const idx = installedListeners.indexOf(listener)
        if (idx >= 0) installedListeners.splice(idx, 1)
      }),
      hasListener: vi.fn((listener: InstalledListener) =>
        installedListeners.includes(listener)
      ),
    },
    getURL: vi.fn((path: string) => `chrome-extension://mock-id/${path}`),
    id: 'mock-extension-id',
  },
  tabs: {
    query: vi.fn(async () => []),
    sendMessage: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  windows: {
    create: vi.fn(),
    remove: vi.fn(),
    update: vi.fn(),
  },
}

export function resetChromeMock() {
  localStorage.clear()
  sessionStorage.clear()
  messageListeners.length = 0
  installedListeners.length = 0
  vi.clearAllMocks()
}

export function getMessageListeners() {
  return messageListeners
}

export function getInstalledListeners() {
  return installedListeners
}
