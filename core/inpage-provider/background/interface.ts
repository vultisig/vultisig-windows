import { Chain } from '@core/chain/Chain'
import { ChainOfKind } from '@core/chain/ChainKind'
import { Method } from '@lib/utils/types/Method'

import { ActiveChainKind } from '../chain'

type GetAppChainMethod<K extends ActiveChainKind = ActiveChainKind> = Method<
  { chainKind: K },
  ChainOfKind<K>
>

export type BackgroundInterface = {
  getAppChainId: Method<{ chainKind: ActiveChainKind }, string>
  getAppChain: GetAppChainMethod
  getAccount: Method<{ chain: Chain }, { address: string; publicKey: string }>
}

export type BackgroundMethod = keyof BackgroundInterface
