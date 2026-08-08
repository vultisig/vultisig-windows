import { InjectedKeplr } from '@keplr-wallet/provider'

type StartProxyKeplr = Parameters<typeof InjectedKeplr.startProxy>[0]

type StartProxyEventListener = NonNullable<
  Parameters<typeof InjectedKeplr.startProxy>[2]
>

type ProxyMessageHandler = Parameters<
  StartProxyEventListener['addMessageListener']
>[0]

const proxyListeners = new WeakMap<
  ProxyMessageHandler,
  (event: MessageEvent) => void
>()

/**
 * Same-window `message` transport for `InjectedKeplr.startProxy`.
 *
 * Same-window only. The library's built-in listener dispatches on `event.data`
 * alone, so it would also serve `proxy-request` messages posted by an embedded
 * frame, and a frame must not be able to act for another frame's origin — the
 * constraint every other window listener in the extension already enforces.
 * Restricting each proxy to its own frame costs nothing: clients always post to
 * their own window, and the content script is injected into every frame, so an
 * embedded dApp is served by the proxy in its own frame under its own origin.
 *
 * `startProxy` detaches its handler by reference, hence the wrapper bookkeeping.
 */
const sameWindowEventListener: StartProxyEventListener = {
  addMessageListener: handler => {
    const listener = (event: MessageEvent) => {
      if (event.source !== window) return
      handler(event)
    }
    proxyListeners.set(handler, listener)
    window.addEventListener('message', listener)
  },
  removeMessageListener: handler => {
    const listener = proxyListeners.get(handler)
    if (!listener) return
    proxyListeners.delete(handler)
    window.removeEventListener('message', listener)
  },
  postMessage: message => window.postMessage(message, window.location.origin),
}

/**
 * Sets up the Keplr `proxy-request` postMessage bridge so cosmos-kit dApps
 * (which talk to Keplr through `@keplr-wallet/provider-extension`) can reach
 * our `window.keplr`.
 *
 * cosmos-kit's `Keplr.getKeplr()` helper short-circuits to `undefined` on
 * Chrome unless `window.keplrRequestMetaIdSupport` is set; once it is, the
 * dApp probes the page with `postMessage({type: 'proxy-request[-<metaId>]', method: 'ping'})`
 * and only resolves after a matching `proxy-request-response` arrives.
 * Without the responder, the dApp's wallet client is `undefined`, connect
 * flips to `setClientNotExist`, and the modal closes without flipping the
 * wallet to "Connected" — even though direct `window.keplr.*` calls succeed.
 *
 * Each cosmos-kit build bakes in its own metaId and namespaces messages as `proxy-request-<metaId>`.
 * `InjectedKeplr.startProxy` only accepts its own metaId or the legacy
 * `proxy-request`, so we hand it a `parseMessage` that strips the suffix
 * and rewrites the type to the legacy form. The dApp's response listener
 * filters by message id, not type, so the round-trip still resolves.
 *
 * The transport is passed explicitly rather than left to the library's default
 * so that each frame's proxy only answers its own frame — see
 * {@link sameWindowEventListener}.
 */
export const installKeplrProxyBridge = (keplr: StartProxyKeplr): void => {
  window.keplrRequestMetaIdSupport = true

  const parseMessage = (data: unknown): unknown => {
    if (!data || typeof data !== 'object' || !('type' in data)) return data
    const { type } = data
    if (typeof type !== 'string') return data
    if (!type.startsWith('proxy-request-')) return data
    if (type.startsWith('proxy-request-response')) return data
    return { ...data, type: 'proxy-request' }
  }

  InjectedKeplr.startProxy(
    keplr,
    undefined,
    sameWindowEventListener,
    parseMessage
  )
}
