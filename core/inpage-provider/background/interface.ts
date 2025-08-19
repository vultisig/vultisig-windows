import { ChainOfKind } from '@core/chain/ChainKind'
import { VaultExport } from '@core/ui/vault/export/core'
import { Method } from '@lib/utils/types/Method'

import { ActiveChainKind } from '../chain'

type GetAppChainMethod<K extends ActiveChainKind = ActiveChainKind> = Method<
  { chainKind: K },
  ChainOfKind<K>
>

export type BackgroundInterface = {
  getVaults: Method<{}, VaultExport[]>
  getAppChainId: Method<{ chainKind: ActiveChainKind }, string>
  getAppChain: GetAppChainMethod
}

export type BackgroundMethod = keyof BackgroundInterface
