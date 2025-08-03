import { VaultExport } from '@core/ui/vault/export/core'
import { ApiMethod } from '@lib/utils/api/ApiMethod'

export type BackgroundApiInterface = {
  getVault: ApiMethod<{}, VaultExport>
}

export type BackgroundApiMethodName = keyof BackgroundApiInterface
