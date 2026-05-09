import { InjectedKeplr, Keplr } from '@keplr-wallet/provider'

type ProxyMessage = { type?: unknown }

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
 * Each cosmos-kit build bakes in its own metaId (Skeletonswap ships
 * `d_2hxd99brRo`) and namespaces messages as `proxy-request-<metaId>`.
 * `InjectedKeplr.startProxy` only accepts its own metaId or the legacy
 * `proxy-request`, so we hand it a `parseMessage` that strips the suffix
 * and rewrites the type to the legacy form. The dApp's response listener
 * filters by message id, not type, so the round-trip still resolves.
 */
export const installKeplrProxyBridge = (keplr: Keplr): void => {
  ;(
    window as Window & { keplrRequestMetaIdSupport?: unknown }
  ).keplrRequestMetaIdSupport = true

  const parseMessage = (data: unknown): unknown => {
    if (!data || typeof data !== 'object') return data
    const { type } = data as ProxyMessage
    if (typeof type !== 'string') return data
    if (!type.startsWith('proxy-request-')) return data
    if (type.startsWith('proxy-request-response')) return data
    return { ...(data as object), type: 'proxy-request' }
  }

  InjectedKeplr.startProxy(
    keplr as Parameters<typeof InjectedKeplr.startProxy>[0],
    undefined,
    undefined,
    parseMessage
  )
}
