import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { EthereumSpecific } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import type { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import { Psbt } from 'bitcoinjs-lib'

import {
  ChainsBySpecific,
  KeysignChainSpecificValue,
} from './KeysignChainSpecific'

type SpecificKeyByValue<R> = Extract<
  Exclude<KeysignPayload['blockchainSpecific'], { case: undefined }>,
  { value: R }
>['case']

export type ChainSpecificResolverInput<
  T = any,
  R = KeysignChainSpecificValue,
> = {
  coin: AccountCoin<ChainsBySpecific<SpecificKeyByValue<R>>>
  receiver?: string
  feeSettings?: T
  isDeposit?: boolean
  amount?: number
  transactionType?: TransactionType
  psbt?: Psbt
} & (R extends EthereumSpecific ? { data?: `0x${string}` } : {})

export type ChainSpecificResolver<
  R = KeysignChainSpecificValue,
  T = any,
> = Resolver<ChainSpecificResolverInput<T, R>, Promise<R>>
