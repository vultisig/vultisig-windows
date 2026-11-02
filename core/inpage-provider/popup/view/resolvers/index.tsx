import { PopupMethod } from '@core/inpage-provider/popup/interface'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { lazy } from 'react'

import { popupResolverLoaders } from './loaders'

type PopupApiImplementation = {
  [K in PopupMethod]: PopupResolver<K>
}

const lazyResolver = <K extends PopupMethod>(method: K): PopupResolver<K> =>
  lazy(() =>
    popupResolverLoaders[method]().then(Resolver => ({ default: Resolver }))
  )

/** Each method's screen, suspending until its module has loaded. */
export const PopupResolvers: PopupApiImplementation = {
  grantVaultAccess: lazyResolver('grantVaultAccess'),
  exportVaults: lazyResolver('exportVaults'),
  pluginReshare: lazyResolver('pluginReshare'),
  signMessage: lazyResolver('signMessage'),
  sendTx: lazyResolver('sendTx'),
  watchAsset: lazyResolver('watchAsset'),
  suggestKeplrChain: lazyResolver('suggestKeplrChain'),
}
