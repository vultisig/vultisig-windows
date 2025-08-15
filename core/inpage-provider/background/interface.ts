import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

export type BackgroundInterface = {
  getVault: Method<{}, VaultExport>
  getVaults: Method<{}, VaultExport[]>
}

export type BackgroundMethod = keyof BackgroundInterface
