import { InjectedKeplr } from '@keplr-wallet/provider'

type StartProxyKeplr = Parameters<typeof InjectedKeplr.startProxy>[0]

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

  InjectedKeplr.startProxy(keplr, undefined, undefined, parseMessage)
}
