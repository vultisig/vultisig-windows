import { VaultAppSession } from '@core/extension/storage/appSessions'
import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

export type PopupInterface = {
  grantVaultAccess: Method<
    { requestOrigin: string },
    { appSession: VaultAppSession }
  >
  exportVaults: Method<{}, { vaults: VaultExport[] }>
  pluginReshare: Method<{ pluginId: string }, { joinUrl: string }>
}

export type PopupMethod = keyof PopupInterface
