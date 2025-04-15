import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'

import { KeysignChainSpecificValue } from './KeysignChainSpecific'

export type ChainSpecificResolverInput<T = any> = {
  coin: AccountCoin
  receiver?: string
  feeSettings?: T
  isDeposit?: boolean
  amount?: number
  transactionType?: TransactionType
}

export type ChainSpecificResolver<R = KeysignChainSpecificValue, T = any> = (
  input: ChainSpecificResolverInput<T>
) => Promise<R>
