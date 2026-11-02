import { LazyComponent, lazyComponent } from '@lib/ui/base/lazyComponent'

import { PopupMethod } from '../../interface'
import { PopupResolver } from '../resolver'

type PopupResolvers = {
  [K in PopupMethod]: LazyComponent<Parameters<PopupResolver<K>>[0]>
}

/** Each method's screen, loaded on demand so a request window evaluates only its own method's code. */
export const popupResolvers: PopupResolvers = {
  grantVaultAccess: lazyComponent(() =>
    import('./grantVaultAccess').then(
      ({ GrantVaultAccess }) => GrantVaultAccess
    )
  ),
  exportVaults: lazyComponent(() =>
    import('./exportVaults').then(({ ExportVaults }) => ExportVaults)
  ),
  pluginReshare: lazyComponent(() =>
    import('./pluginReshare').then(({ PluginReshare }) => PluginReshare)
  ),
  signMessage: lazyComponent(() =>
    import('./signMessage').then(({ SignMessage }) => SignMessage)
  ),
  sendTx: lazyComponent(() => import('./sendTx').then(({ SendTx }) => SendTx)),
  watchAsset: lazyComponent(() =>
    import('./watchAsset').then(({ WatchAsset }) => WatchAsset)
  ),
  suggestKeplrChain: lazyComponent(() =>
    import('./suggestKeplrChain').then(
      ({ SuggestKeplrChain }) => SuggestKeplrChain
    )
  ),
}

/** Methods whose screen ends in an MPC ceremony, so the SDK is worth warming while the user reviews. */
export const popupMethodsUsingMpc: Record<PopupMethod, boolean> = {
  grantVaultAccess: false,
  exportVaults: false,
  pluginReshare: true,
  signMessage: true,
  sendTx: true,
  watchAsset: false,
  suggestKeplrChain: false,
}
