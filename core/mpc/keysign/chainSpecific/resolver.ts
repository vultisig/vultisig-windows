import { AccountCoin } from '@core/chain/coin/AccountCoin'
import { EvmFeeSettings } from '@core/chain/tx/fee/evm/EvmFeeSettings'
import { TronFeeSettings } from '@core/chain/tx/fee/tron/tronFeeSettings'
import {
  CosmosSpecific,
  EthereumSpecific,
  TronSpecific,
  UTXOSpecific,
} from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
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

export type ChainSpecificResolverInput<R = KeysignChainSpecificValue> = {
  coin: AccountCoin<ChainsBySpecific<SpecificKeyByValue<R>>>
  receiver?: string
  isDeposit?: boolean
  amount?: bigint
  transactionType?: TransactionType
} & (R extends EthereumSpecific
  ? {
      data?: string
      feeQuote?: Partial<EvmFeeSettings>
    }
  : R extends TronSpecific
    ? { feeQuote?: Partial<TronFeeSettings> }
    : R extends UTXOSpecific
      ? { isComplexTx?: boolean; psbt?: Psbt }
      : R extends CosmosSpecific
        ? { timeoutTimestamp?: string }
        : {})

export type ChainSpecificResolver<R = KeysignChainSpecificValue> = Resolver<
  ChainSpecificResolverInput<R>,
  Promise<R>
>
