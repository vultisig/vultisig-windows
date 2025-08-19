import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

import { ActiveChainKind } from '../chain'

export type BackgroundInterface = {
  getVault: Method<{}, VaultExport>
  getVaults: Method<{}, VaultExport[]>
  getAppChainId: Method<{ chainKind: ActiveChainKind }, string>
}

export type BackgroundMethod = keyof BackgroundInterface
