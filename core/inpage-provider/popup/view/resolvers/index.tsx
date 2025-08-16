import { PopupMethod } from '@core/inpage-provider/popup/interface'

import { PopupResolver } from '../resolver'
import { GrantVaultAccess } from './grantVaultAccess'
import { GrantVaultsAccess } from './grantVaultsAccess'
import { PluginReshare } from './pluginReshare'

type PopupApiImplementation = {
  [K in PopupMethod]: PopupResolver<K>
}

export const PopupResolvers: PopupApiImplementation = {
  grantVaultAccess: GrantVaultAccess,
  grantVaultsAccess: GrantVaultsAccess,
  pluginReshare: PluginReshare,
}
