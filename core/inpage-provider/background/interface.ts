import { Chain } from '@core/chain/Chain'
import { ChainOfKind } from '@core/chain/ChainKind'
import { Method } from '@lib/utils/types/Method'

import { ActiveChainKind } from '../chain'

type GetAppChainMethod<K extends ActiveChainKind = ActiveChainKind> = Method<
  { chainKind: K },
  ChainOfKind<K>
>

export type SetAppChainInput = {
  [K in ActiveChainKind]: { [P in K]: ChainOfKind<P> }
}[ActiveChainKind]

export type BackgroundInterface = {
  getAppChainId: Method<{ chainKind: ActiveChainKind }, string>
  setAppChain: Method<SetAppChainInput>
  getAppChain: GetAppChainMethod
  getAccount: Method<{ chain: Chain }, { address: string; publicKey: string }>
  signOut: Method<{}>
  evmClientRequest: Method<{ method: string; params?: unknown[] }, unknown>
}

export type BackgroundMethod = keyof BackgroundInterface
