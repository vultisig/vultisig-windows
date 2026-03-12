import { vi } from 'vitest'

type MockHandler = (...args: unknown[]) => unknown

const backgroundHandlers = new Map<string, MockHandler>()
const popupHandlers = new Map<string, MockHandler>()

/**
 * Creates a mock for `callBackground` that dispatches based on the method key.
 * Usage:
 *   mockBackgroundResponse('getAccount', { address: '0x123' })
 *   mockBackgroundResponse('getAppChainId', '0x1')
 *   mockBackgroundError('getAccount', BackgroundError.Unauthorized)
 */
export const mockCallBackground = vi.fn(async (call: Record<string, unknown>) => {
  const method = Object.keys(call)[0]
  if (!method) throw new Error('Empty background call')
  const handler = backgroundHandlers.get(method)
  if (!handler) throw new Error(`No mock for background method: ${method}`)
  return handler(call[method])
})

export const mockCallPopup = vi.fn(
  async (call: Record<string, unknown>, _options?: unknown) => {
    const method = Object.keys(call)[0]
    if (!method) throw new Error('Empty popup call')
    const handler = popupHandlers.get(method)
    if (!handler) throw new Error(`No mock for popup method: ${method}`)
    return handler(call[method])
  }
)

export function mockBackgroundResponse(method: string, response: unknown) {
  backgroundHandlers.set(method, () => response)
}

export function mockBackgroundError(method: string, error: unknown) {
  backgroundHandlers.set(method, () => {
    throw error
  })
}

export function mockPopupResponse(method: string, response: unknown) {
  popupHandlers.set(method, () => response)
}

export function mockPopupError(method: string, error: unknown) {
  popupHandlers.set(method, () => {
    throw error
  })
}

export function resetBridgeMocks() {
  backgroundHandlers.clear()
  popupHandlers.clear()
  mockCallBackground.mockClear()
  mockCallPopup.mockClear()
}
