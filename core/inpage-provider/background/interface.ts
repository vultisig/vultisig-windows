import { AppSession } from '@core/extension/storage/appSessions'
import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

export type BackgroundInterface = {
  getVault: Method<{}, VaultExport>
  getVaults: Method<{}, VaultExport[]>
  getAppSession: Method<{}, AppSession>
}

export type BackgroundMethod = keyof BackgroundInterface
