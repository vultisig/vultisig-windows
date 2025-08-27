import { Chain } from '@core/chain/Chain'
import { VaultAppSession } from '@core/extension/storage/appSessions'
import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

export type PopupInterface = {
  grantVaultAccess: Method<{}, { appSession: VaultAppSession }>
  exportVaults: Method<{}, VaultExport[]>
  pluginReshare: Method<{ pluginId: string }, { joinUrl: string }>
  signMessage: Method<{ message: string; chain: Chain }, string>
}

export type PopupMethod = keyof PopupInterface

export const mergeableInFlightPopupMethods: PopupMethod[] = ['grantVaultAccess']

export const authorizedPopupMethods = [
  'signMessage',
  'pluginReshare',
] as const satisfies readonly PopupMethod[]

export type AuthorizedPopupMethod = (typeof authorizedPopupMethods)[number]
