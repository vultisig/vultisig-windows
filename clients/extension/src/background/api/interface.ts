import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

export type BackgroundApiInterface = {
  getVault: Method<{}, VaultExport>
  getVaults: Method<{}, VaultExport[]>
}

export type BackgroundApiMethodName = keyof BackgroundApiInterface
