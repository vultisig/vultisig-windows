import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { EthereumSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { Resolver } from '@lib/utils/types/Resolver'

import { KeysignChainSpecificValue } from './KeysignChainSpecific'

export type ChainSpecificResolverInput<
  T = any,
  R = KeysignChainSpecificValue,
> = {
  coin: AccountCoin
  receiver?: string
  feeSettings?: T
  isDeposit?: boolean
  amount?: number
  transactionType?: TransactionType
} & (R extends EthereumSpecific ? { data?: `0x${string}` } : {})

export type ChainSpecificResolver<
  R = KeysignChainSpecificValue,
  T = any,
> = Resolver<ChainSpecificResolverInput<T, R>, Promise<R>>
