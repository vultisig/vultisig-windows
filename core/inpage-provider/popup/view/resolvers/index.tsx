import { PopupMethod } from '@core/inpage-provider/popup/interface'
import { PopupResolver } from '@core/inpage-provider/popup/view/resolver'
import { ExportVaults } from '@core/inpage-provider/popup/view/resolvers/exportVaults'
import { GrantVaultAccess } from '@core/inpage-provider/popup/view/resolvers/grantVaultAccess'
import { PluginReshare } from '@core/inpage-provider/popup/view/resolvers/pluginReshare'
import { SendTx } from '@core/inpage-provider/popup/view/resolvers/sendTx'
import { SignMessage } from '@core/inpage-provider/popup/view/resolvers/signMessage'

type PopupApiImplementation = {
  [K in PopupMethod]: PopupResolver<K>
}

export const PopupResolvers: PopupApiImplementation = {
  grantVaultAccess: GrantVaultAccess,
  exportVaults: ExportVaults,
  pluginReshare: PluginReshare,
  signMessage: SignMessage,
  sendTx: SendTx,
}
