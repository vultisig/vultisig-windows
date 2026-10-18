import { getBridgeMessageSourceId } from '@lib/extension/bridge/core'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockHasAppSession = vi.hoisted(() => vi.fn())
const mockCallPopupFromBackground = vi.hoisted(() => vi.fn())

vi.mock('../background/resolvers', () => ({
  backgroundResolvers: {
    hasAppSession: (...args: unknown[]) => mockHasAppSession(...args),
  },
}))

vi.mock('../popup/resolvers/background', () => ({
  callPopupFromBackground: (...args: unknown[]) =>
    mockCallPopupFromBackground(...args),
}))

import { runInpageProviderBridgeBackgroundAgent } from './background'

type MessageListener = (
  request: unknown,
  sender: { frameId: number; origin: string; tab: object },
  sendResponse: (response: unknown) => void
) => unknown

const postFromPage = async (message: unknown) => {
  let listener: MessageListener | undefined
  vi.stubGlobal('chrome', {
    runtime: {
      onMessage: {
        addListener: (added: MessageListener) => {
          listener = added
        },
      },
    },
  })
  runInpageProviderBridgeBackgroundAgent()

  const sendResponse = vi.fn()
  listener?.(
    { id: 'request-1', sourceId: getBridgeMessageSourceId('inpage'), message },
    { frameId: 0, origin: 'https://site.example', tab: {} },
    sendResponse
  )

  await vi.waitFor(() => {
    expect(sendResponse).toHaveBeenCalledTimes(1)
  })

  return sendResponse.mock.calls[0][0].message
}

describe('runInpageProviderBridgeBackgroundAgent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('answers a removed background method with an unsupported method error', async () => {
    const reply = await postFromPage({
      background: {
        call: { addKeplrSuggestedChain: { chainInfo: { chainId: 'x-1' } } },
      },
    })

    expect(reply).toEqual({
      error: {
        code: 4200,
        message: 'Unsupported method: addKeplrSuggestedChain',
      },
    })
  })

  it('does not dispatch an inherited object property as a background method', async () => {
    const reply = await postFromPage({
      background: { call: { constructor: {} } },
    })

    expect(reply).toEqual({
      error: { code: 4200, message: 'Unsupported method: constructor' },
    })
  })

  it('answers an unknown popup method without opening a popup', async () => {
    const reply = await postFromPage({
      popup: { call: { removedPopupMethod: {} }, options: {} },
    })

    expect(reply).toEqual({
      error: { code: 4200, message: 'Unsupported method: removedPopupMethod' },
    })
    expect(mockCallPopupFromBackground).not.toHaveBeenCalled()
  })

  it('still dispatches a supported background method', async () => {
    mockHasAppSession.mockResolvedValue(true)

    const reply = await postFromPage({
      background: { call: { hasAppSession: {} } },
    })

    expect(reply).toEqual({ data: true })
    expect(mockHasAppSession).toHaveBeenCalledWith({
      input: {},
      context: expect.objectContaining({
        requestOrigin: 'https://site.example',
      }),
    })
  })

  it('still opens a popup for a supported popup method', async () => {
    mockCallPopupFromBackground.mockResolvedValue(true)

    const reply = await postFromPage({
      popup: { call: { exportVaults: {} }, options: {} },
    })

    expect(reply).toEqual({ data: true })
    expect(mockCallPopupFromBackground).toHaveBeenCalledTimes(1)
  })
})
