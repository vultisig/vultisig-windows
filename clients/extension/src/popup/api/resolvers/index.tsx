import { PopupApiInterface } from '../interface'
import { PopupApiResolver } from '../resolver'
import { GrantVaultAccess } from './grantVaultAccess'
import { GrantVaultsAccess } from './grantVaultsAccess'
import { PluginReshare } from './pluginReshare'

type PopupApiImplementation = {
  [K in keyof PopupApiInterface]: PopupApiResolver<K>
}

export const popupApiResolvers: PopupApiImplementation = {
  grantVaultAccess: GrantVaultAccess,
  grantVaultsAccess: GrantVaultsAccess,
  pluginReshare: PluginReshare,
}
