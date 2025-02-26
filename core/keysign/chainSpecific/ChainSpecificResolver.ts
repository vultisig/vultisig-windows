import { AccountCoin } from '@core/chain/coin/AccountCoin'

import { KeysignChainSpecificValue } from './KeysignChainSpecific'

export type ChainSpecificResolverInput<T = any> = {
  coin: AccountCoin
  receiver?: string
  feeSettings?: T
  isDeposit?: boolean
  amount?: number
}

export type ChainSpecificResolver<R = KeysignChainSpecificValue, T = any> = (
  input: ChainSpecificResolverInput<T>
) => Promise<R>
