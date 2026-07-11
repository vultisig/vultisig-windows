// @vitest-environment happy-dom

/**
 * Protocol contract for the GemWallet-compatible bridge.
 *
 * These tests drive the real `@gemwallet/api` SDK — the same package XRPL dApps
 * import — against our injected bridge, so any drift in the wire format (the
 * `messagedId` correlation key, the response envelope, the reject shape) fails
 * here rather than silently making us undetectable.
 */
import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { installGemWalletBridge } from '@clients/extension/src/inpage/providers/gemWallet'
import {
  gemWalletApp,
  gemWalletRequestSource,
  gemWalletResponseSource,
} from '@clients/extension/src/inpage/providers/gemWallet/protocol'
import {
  getAddress,
  getNetwork,
  getPublicKey,
  isInstalled,
} from '@gemwallet/api'
import { OtherChain } from '@vultisig/core-chain/Chain'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const mockRequestAccount = vi.fn()

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: (...args: unknown[]) => mockRequestAccount(...args),
}))

const address = 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'
const publicKey =
  '0330e7fc9d56bb25d6893ba3f317ae5bcf33b3291bd63db32654a313222f7fd020'

/**
 * happy-dom delivers `postMessage` with a `source` of its own and on its own
 * schedule. Both details are load-bearing here:
 *
 * - `source` must be the posting window, because the SDK (and our bridge) drop
 *   any message that fails that same-window check.
 * - delivery must be asynchronous, because the SDK posts its request *before*
 *   registering the listener that awaits the reply. A synchronous dispatch
 *   would answer into the void and every call would hang.
 *
 * Re-dispatching this way is what a real browser does, so the round-trip under
 * test is the real one.
 */
const installBrowserFaithfulPostMessage = () => {
  vi.spyOn(window, 'postMessage').mockImplementation((message: unknown) => {
    setTimeout(() => {
      window.dispatchEvent(
        new MessageEvent('message', {
          data: message,
          origin: window.location.origin,
          source: window,
        })
      )
    }, 0)
  })
}

/** Posts a raw envelope the way the SDK does, for types it has no helper for. */
const sendRawRequest = (type: string) =>
  new Promise<Record<string, unknown>>(resolve => {
    const messageId = Date.now() + Math.random()

    window.addEventListener('message', function listener(event: MessageEvent) {
      if (event.data?.source !== gemWalletResponseSource) return
      if (event.data?.messagedId !== messageId) return

      window.removeEventListener('message', listener)
      resolve(event.data)
    })

    window.postMessage(
      { source: gemWalletRequestSource, messageId, app: gemWalletApp, type },
      window.location.origin
    )
  })

describe('GemWallet-compatible provider', () => {
  beforeAll(() => {
    installBrowserFaithfulPostMessage()
    installGemWalletBridge()
  })

  beforeEach(() => {
    mockRequestAccount.mockReset()
    mockRequestAccount.mockResolvedValue({ address, publicKey })
    window.gemWallet = true
  })

  describe('detection', () => {
    it('is detected through the window flag the SDK probes first', async () => {
      await expect(isInstalled()).resolves.toEqual({
        result: { isInstalled: true },
      })
    })

    it('is detected over the message protocol when the flag is absent', async () => {
      // The flag short-circuits `isInstalled()`, so drop it to force the SDK
      // down its postMessage path — the one that actually pins the envelope.
      delete window.gemWallet

      await expect(isInstalled()).resolves.toEqual({
        result: { isInstalled: true },
      })
    })
  })

  describe('connect', () => {
    it('getAddress returns the vault XRP address after authorization', async () => {
      await expect(getAddress()).resolves.toEqual({
        type: 'response',
        result: { address },
      })

      expect(mockRequestAccount).toHaveBeenCalledWith(OtherChain.Ripple)
    })

    it('getPublicKey returns the address and uppercase public key', async () => {
      await expect(getPublicKey()).resolves.toEqual({
        type: 'response',
        result: { address, publicKey: publicKey.toUpperCase() },
      })
    })

    it('getNetwork returns the XRPL mainnet descriptor without prompting', async () => {
      await expect(getNetwork()).resolves.toEqual({
        type: 'response',
        result: {
          chain: 'XRPL',
          network: 'Mainnet',
          websocket: 'wss://xrplcluster.com',
        },
      })

      expect(mockRequestAccount).not.toHaveBeenCalled()
    })
  })

  describe('failures', () => {
    it('reports a declined grant as a reject, not a throw', async () => {
      mockRequestAccount.mockRejectedValue(
        new EIP1193Error('UserRejectedRequest')
      )

      await expect(getAddress()).resolves.toEqual({
        type: 'reject',
        result: undefined,
      })
    })

    it('surfaces a genuine failure as a thrown error', async () => {
      mockRequestAccount.mockRejectedValue(new Error('vault is locked'))

      await expect(getAddress()).rejects.toThrow('vault is locked')
    })

    it('answers unsupported methods instead of hanging the dApp', async () => {
      const response = await sendRawRequest('REQUEST_SIGN_TRANSACTION/V3')

      expect(response.error).toMatchObject({
        message: expect.stringContaining('not supported'),
      })
    })

    it('ignores messages that are not GemWallet requests', async () => {
      const responses: unknown[] = []
      window.addEventListener('message', (event: MessageEvent) => {
        if (event.data?.source === gemWalletResponseSource)
          responses.push(event.data)
      })

      window.postMessage({ source: 'SOME_OTHER_WALLET' }, '*')
      await new Promise(resolve => setTimeout(resolve, 20))

      expect(responses).toHaveLength(0)
    })
  })

  it('correlates concurrent requests by message id', async () => {
    // Resolve the address slowly so its reply lands after getNetwork's. If the
    // bridge dropped the id correlation, the SDK would hand the network payload
    // to the address caller.
    mockRequestAccount.mockImplementation(
      () =>
        new Promise(resolve =>
          setTimeout(() => resolve({ address, publicKey }), 30)
        )
    )

    const [addressResponse, networkResponse] = await Promise.all([
      getAddress(),
      getNetwork(),
    ])

    expect(addressResponse.result).toEqual({ address })
    expect(networkResponse.result).toMatchObject({ chain: 'XRPL' })
  })
})
