import { vi } from 'vitest'

const storage = new Map<string, unknown>()

type MessageListener = (
  message: unknown,
  sender: unknown,
  sendResponse: (response?: unknown) => void
) => void

const messageListeners: MessageListener[] = []

export const chromeMock = {
  storage: {
    local: {
      get: vi.fn(async (keys?: string | string[] | Record<string, unknown>) => {
        if (!keys) {
          const result: Record<string, unknown> = {}
          storage.forEach((v, k) => {
            result[k] = v
          })
          return result
        }
        if (typeof keys === 'string') {
          return { [keys]: storage.get(keys) }
        }
        if (Array.isArray(keys)) {
          const result: Record<string, unknown> = {}
          keys.forEach(k => {
            result[k] = storage.get(k)
          })
          return result
        }
        // Object with defaults
        const result: Record<string, unknown> = {}
        for (const [k, def] of Object.entries(keys)) {
          result[k] = storage.has(k) ? storage.get(k) : def
        }
        return result
      }),
      set: vi.fn(async (items: Record<string, unknown>) => {
        for (const [k, v] of Object.entries(items)) {
          storage.set(k, v)
        }
      }),
      remove: vi.fn(async (keys: string | string[]) => {
        const arr = Array.isArray(keys) ? keys : [keys]
        arr.forEach(k => {
          storage.delete(k)
        })
      }),
      clear: vi.fn(async () => {
        storage.clear()
      }),
    },
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
  storage.clear()
  messageListeners.length = 0
  vi.clearAllMocks()
}

export function getMessageListeners() {
  return messageListeners
}
