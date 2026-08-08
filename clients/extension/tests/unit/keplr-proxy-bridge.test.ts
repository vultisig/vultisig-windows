// @vitest-environment happy-dom

/**
 * Frame isolation for the Keplr `proxy-request` bridge.
 *
 * The bridge installs a `window` message listener, and `window` receives
 * messages from embedded frames as readily as from the page itself. A frame must
 * not be able to act for another frame's origin, so these tests pin the
 * same-window constraint in both directions: own-frame requests still served,
 * other-frame requests ignored.
 */
import { installKeplrProxyBridge } from '@clients/extension/src/inpage/providers/keplrProxyBridge'
import { beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

const getKey = vi.fn()
const signAmino = vi.fn()

type BridgeKeplr = Parameters<typeof installKeplrProxyBridge>[0]

const keplr = { getKey, signAmino } as unknown as BridgeKeplr

/**
 * happy-dom's `postMessage` does not populate `source`, which is the very field
 * under test. Re-dispatch the way a real browser does: `source` is the posting
 * window, and delivery is asynchronous.
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

const flush = () => new Promise(resolve => setTimeout(resolve, 0))

const proxyRequest = (
  type: string,
  method: string,
  args: unknown[],
  id = 'request-id'
) => ({
  type,
  id,
  method,
  args,
})

describe('Keplr proxy bridge frame isolation', () => {
  beforeAll(() => {
    installBrowserFaithfulPostMessage()
    installKeplrProxyBridge(keplr)
  })

  beforeEach(() => {
    getKey.mockReset()
    getKey.mockResolvedValue({ bech32Address: 'cosmos1abc' })
    signAmino.mockReset()
    signAmino.mockResolvedValue({})
  })

  describe('messages from the page itself', () => {
    it('serves the legacy proxy-request type', async () => {
      window.postMessage(
        proxyRequest('proxy-request', 'getKey', ['cosmoshub-4']),
        window.location.origin
      )
      await flush()

      expect(getKey).toHaveBeenCalledWith('cosmoshub-4')
    })

    // A distinct chainId, so a call still in flight from the previous test
    // cannot satisfy this assertion.
    it('serves the metaId-namespaced type cosmos-kit builds emit', async () => {
      window.postMessage(
        proxyRequest('proxy-request-abc123', 'getKey', ['osmosis-1']),
        window.location.origin
      )
      await flush()

      expect(getKey).toHaveBeenCalledWith('osmosis-1')
    })

    // Supplying our own transport means we also own the reply leg the library
    // would otherwise have provided, so assert the round-trip still resolves.
    it('posts the result back under the id the client correlates on', async () => {
      // Replies are correlated by id, exactly as the client does — earlier
      // tests in this file do not await their own reply timers, so their
      // responses can still be in flight here.
      const id = 'round-trip-request'
      const responses: Record<string, unknown>[] = []
      window.addEventListener('message', (event: MessageEvent) => {
        if (
          event.data?.id === id &&
          event.data?.type === 'proxy-request-response'
        ) {
          responses.push(event.data)
        }
      })

      window.postMessage(
        proxyRequest('proxy-request', 'getKey', ['cosmoshub-4'], id),
        window.location.origin
      )
      await flush()
      await flush()

      expect(responses).toEqual([
        {
          type: 'proxy-request-response',
          id,
          result: { return: { bech32Address: 'cosmos1abc' } },
        },
      ])
    })
  })

  describe('messages from an embedded frame', () => {
    const postAsFrame = async (data: unknown) => {
      const frame = document.createElement('iframe')
      document.body.appendChild(frame)
      const frameWindow = frame.contentWindow
      expect(frameWindow).toBeTruthy()
      expect(frameWindow).not.toBe(window)

      window.dispatchEvent(
        new MessageEvent('message', {
          data,
          origin: 'https://embedded.example',
          source: frameWindow,
        })
      )
      await flush()
      frame.remove()
    }

    it('ignores an account read request', async () => {
      await postAsFrame(
        proxyRequest('proxy-request', 'getKey', ['cosmoshub-4'])
      )

      expect(getKey).not.toHaveBeenCalled()
    })

    it('ignores a sign request regardless of the type suffix used', async () => {
      await postAsFrame(
        proxyRequest('proxy-request-abc123', 'signAmino', [
          'cosmoshub-4',
          'cosmos1abc',
          {},
        ])
      )

      expect(signAmino).not.toHaveBeenCalled()
    })
  })
})
