import { VaultAppSession } from '@core/extension/storage/appSessions'
import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

export type PopupInterface = {
  grantVaultAccess: Method<{}, { appSession: VaultAppSession }>
  exportVaults: Method<{}, VaultExport[]>
  pluginReshare: Method<{ pluginId: string }, { joinUrl: string }>
}

export type PopupMethod = keyof PopupInterface

// Methods whose in-flight calls are merged; subsequent calls while the first is pending receive the first result.
export const mergeableInFlightPopupMethods: PopupMethod[] = ['grantVaultAccess']
