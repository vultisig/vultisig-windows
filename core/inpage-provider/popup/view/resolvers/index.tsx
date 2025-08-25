import { PopupMethod } from '@core/inpage-provider/popup/interface'

import { PopupResolver } from '../resolver'
import { ExportVaults } from './exportVaults'
import { GrantVaultAccess } from './grantVaultAccess'
import { PluginReshare } from './pluginReshare'

type PopupApiImplementation = {
  [K in PopupMethod]: PopupResolver<K>
}

export const PopupResolvers: PopupApiImplementation = {
  grantVaultAccess: GrantVaultAccess,
  exportVaults: ExportVaults,
  pluginReshare: PluginReshare,
}
