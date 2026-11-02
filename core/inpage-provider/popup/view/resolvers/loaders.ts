import { PopupMethod } from '@core/inpage-provider/popup/interface'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'

type PopupResolverLoaders = {
  [K in PopupMethod]: () => Promise<PopupResolver<K>>
}

/** Loads each popup method's screen on demand, so a request window evaluates only its own method's code. */
export const popupResolverLoaders: PopupResolverLoaders = {
  grantVaultAccess: () =>
    import('./grantVaultAccess').then(
      ({ GrantVaultAccess }) => GrantVaultAccess
    ),
  exportVaults: () =>
    import('./exportVaults').then(({ ExportVaults }) => ExportVaults),
  pluginReshare: () =>
    import('./pluginReshare').then(({ PluginReshare }) => PluginReshare),
  signMessage: () =>
    import('./signMessage').then(({ SignMessage }) => SignMessage),
  sendTx: () => import('./sendTx').then(({ SendTx }) => SendTx),
  watchAsset: () => import('./watchAsset').then(({ WatchAsset }) => WatchAsset),
  suggestKeplrChain: () =>
    import('./suggestKeplrChain').then(
      ({ SuggestKeplrChain }) => SuggestKeplrChain
    ),
}
