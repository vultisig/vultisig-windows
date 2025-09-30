import { PopupMethod } from '@core/inpage-provider/popup/interface'

import { PopupResolver } from '../resolver'
import { ExportVaults } from './exportVaults'
import { GrantVaultAccess } from './grantVaultAccess'
import { PluginConnectSign } from './pluginConnectSign'
import { PluginPolicySign } from './pluginPolicySign'
import { PluginReshare } from './pluginReshare'
import { SendTx } from './sendTx'
import { SignMessage } from './signMessage'

type PopupApiImplementation = {
  [K in PopupMethod]: PopupResolver<K>
}

export const PopupResolvers: PopupApiImplementation = {
  grantVaultAccess: GrantVaultAccess,
  exportVaults: ExportVaults,
  pluginReshare: PluginReshare,
  pluginConnectSign: PluginConnectSign,
  pluginPolicySign: PluginPolicySign,
  signMessage: SignMessage,
  sendTx: SendTx,
}
