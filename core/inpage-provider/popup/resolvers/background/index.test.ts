import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAddPopupViewCall = vi.hoisted(() => vi.fn())
const mockRemovePopupViewCall = vi.hoisted(() => vi.fn())
const mockInNewWindow = vi.hoisted(() => vi.fn())

vi.mock('../../view/state/calls', () => ({
  addPopupViewCall: (...args: unknown[]) => mockAddPopupViewCall(...args),
  removePopupViewCall: (...args: unknown[]) => mockRemovePopupViewCall(...args),
}))

vi.mock('./inNewWindow', () => ({
  inNewWindow: (...args: unknown[]) => mockInNewWindow(...args),
}))

import {
  PopupError,
  signingFailedPopupResult,
  userRejectedPopupResult,
} from '../../error'
import { getPopupMessageSourceId } from '../../resolver'
import { callPopupFromBackground } from '.'

describe('callPopupFromBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('chrome', {
      runtime: {
        getURL: (path: string) => `chrome-extension://id/${path}`,
      },
    })
    mockAddPopupViewCall.mockResolvedValue('call-1')
    mockRemovePopupViewCall.mockResolvedValue(undefined)
  })

  it('coalesces concurrent grantVaultAccess popups with the same origin and input', async () => {
    const appSession = {
      vaultId: 'vault-1',
      host: 'example.com',
      url: 'https://example.com',
    }
    let resolvePopup: (value: unknown) => void = () => undefined
    mockInNewWindow.mockReturnValue(
      new Promise(resolve => {
        resolvePopup = resolve
      })
    )

    const first = callPopupFromBackground({
      call: {
        grantVaultAccess: {
          chain: Chain.Cosmos,
          chains: [Chain.Cosmos, Chain.Polygon],
        },
      },
      options: {},
      context: {
        requestOrigin: 'https://example.com',
      },
    })
    const second = callPopupFromBackground({
      call: {
        grantVaultAccess: {
          chain: Chain.Cosmos,
          chains: [Chain.Cosmos, Chain.Polygon],
        },
      },
      options: {},
      context: {
        requestOrigin: 'https://example.com',
      },
    })

    await vi.waitFor(() => {
      expect(mockInNewWindow).toHaveBeenCalledTimes(1)
    })

    resolvePopup({ appSession })

    await expect(first).resolves.toEqual({ appSession })
    await expect(second).resolves.toEqual({ appSession })
    expect(mockAddPopupViewCall).toHaveBeenCalledTimes(1)
  })

  it('keeps separate grantVaultAccess popups for different requested permissions', async () => {
    mockInNewWindow.mockResolvedValue({
      appSession: {
        vaultId: 'vault-1',
        host: 'example.com',
        url: 'https://example.com',
      },
    })

    await Promise.all([
      callPopupFromBackground({
        call: { grantVaultAccess: { chain: Chain.Cosmos } },
        options: {},
        context: { requestOrigin: 'https://one.example.com' },
      }),
      callPopupFromBackground({
        call: { grantVaultAccess: { chain: Chain.Polygon } },
        options: {},
        context: { requestOrigin: 'https://one.example.com' },
      }),
    ])

    expect(mockInNewWindow).toHaveBeenCalledTimes(2)
  })

  it('rejects with the RejectedByUser sentinel when the popup view declines', async () => {
    const listeners = new Set<(message: unknown) => void>()
    vi.stubGlobal('chrome', {
      runtime: {
        getURL: (path: string) => `chrome-extension://id/${path}`,
        onMessage: {
          addListener: (listener: (message: unknown) => void) =>
            listeners.add(listener),
          removeListener: (listener: (message: unknown) => void) =>
            listeners.delete(listener),
        },
      },
    })
    type ExecuteWindow = {
      execute: (input: {
        abortSignal: AbortSignal
        close: () => void
      }) => Promise<unknown>
    }
    mockInNewWindow.mockImplementation(({ execute }: ExecuteWindow) =>
      execute({
        abortSignal: new AbortController().signal,
        close: () => undefined,
      })
    )

    const call = callPopupFromBackground({
      call: { grantVaultAccess: { chain: Chain.Ethereum } },
      options: {},
      context: { requestOrigin: 'https://reject.example.com' },
    })

    await vi.waitFor(() => {
      expect(listeners.size).toBe(1)
    })

    // chrome.runtime messaging serializes the response, so anything the view
    // sends has to survive the trip — an `Error` instance would not.
    const response = JSON.parse(
      JSON.stringify({
        sourceId: getPopupMessageSourceId('popup'),
        callId: 'call-1',
        result: userRejectedPopupResult,
        shouldClosePopup: true,
      })
    )
    listeners.forEach(listener => listener(response))

    await expect(call).rejects.toBe(PopupError.RejectedByUser)
  })

  it('rejects with the SigningFailed sentinel when signing fails', async () => {
    const listeners = new Set<(message: unknown) => void>()
    vi.stubGlobal('chrome', {
      runtime: {
        getURL: (path: string) => `chrome-extension://id/${path}`,
        onMessage: {
          addListener: (listener: (message: unknown) => void) =>
            listeners.add(listener),
          removeListener: (listener: (message: unknown) => void) =>
            listeners.delete(listener),
        },
      },
    })
    type ExecuteWindow = {
      execute: (input: {
        abortSignal: AbortSignal
        close: () => void
      }) => Promise<unknown>
    }
    mockInNewWindow.mockImplementation(({ execute }: ExecuteWindow) =>
      execute({
        abortSignal: new AbortController().signal,
        close: () => undefined,
      })
    )

    const call = callPopupFromBackground({
      call: { grantVaultAccess: { chain: Chain.Ethereum } },
      options: {},
      context: { requestOrigin: 'https://fail.example.com' },
    })

    await vi.waitFor(() => {
      expect(listeners.size).toBe(1)
    })

    // The serialization round trip is the whole point: `new Error('Signing
    // failed')` would arrive here as `{}` and the reason would be lost.
    const response = JSON.parse(
      JSON.stringify({
        sourceId: getPopupMessageSourceId('popup'),
        callId: 'call-1',
        result: signingFailedPopupResult,
        shouldClosePopup: true,
      })
    )
    listeners.forEach(listener => listener(response))

    await expect(call).rejects.toBe(PopupError.SigningFailed)
  })

  it('shows the request for the browser window of the dApp tab', async () => {
    mockInNewWindow.mockResolvedValue({ appSession: undefined })

    await callPopupFromBackground({
      call: { grantVaultAccess: { chain: Chain.Ethereum } },
      options: {},
      context: {
        requestOrigin: 'https://window.example.com',
        requestWindowId: 4,
      },
    })

    expect(mockInNewWindow).toHaveBeenCalledWith(
      expect.objectContaining({ windowId: 4 })
    )
  })

  it('drops the stored call once the popup has answered', async () => {
    mockInNewWindow.mockResolvedValue({ appSession: undefined })

    await callPopupFromBackground({
      call: { grantVaultAccess: { chain: Chain.Ethereum } },
      options: {},
      context: { requestOrigin: 'https://answered.example.com' },
    })

    expect(mockRemovePopupViewCall).toHaveBeenCalledWith('call-1')
  })

  it('drops the stored call when its popup window cannot be opened', async () => {
    mockInNewWindow.mockRejectedValue(new Error('Failed to create new window'))

    await expect(
      callPopupFromBackground({
        call: { grantVaultAccess: { chain: Chain.Ethereum } },
        options: {},
        context: { requestOrigin: 'https://no-window.example.com' },
      })
    ).rejects.toThrow('Failed to create new window')

    expect(mockRemovePopupViewCall).toHaveBeenCalledWith('call-1')
  })

  it('keeps the popup answer when dropping the stored call fails', async () => {
    const appSession = {
      vaultId: 'vault-1',
      host: 'example.com',
      url: 'https://example.com',
    }
    mockInNewWindow.mockResolvedValue({ appSession })
    mockRemovePopupViewCall.mockRejectedValue(new Error('Storage unavailable'))

    await expect(
      callPopupFromBackground({
        call: { grantVaultAccess: { chain: Chain.Ethereum } },
        options: {},
        context: { requestOrigin: 'https://cleanup.example.com' },
      })
    ).resolves.toEqual({ appSession })
  })
})
