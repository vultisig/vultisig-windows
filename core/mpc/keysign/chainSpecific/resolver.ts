import type { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import { WalletCore } from '@trustwallet/wallet-core'
import { Psbt } from 'bitcoinjs-lib'

import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import { FeeSettings } from './FeeSettings'
import {
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from './KeysignChainSpecific'

type ValueForCase<C extends KeysignChainSpecificKey> = Extract<
  KeysignChainSpecific,
  { case: C }
>['value']

export type GetChainSpecificInput<
  C extends KeysignChainSpecificKey = KeysignChainSpecificKey,
> = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
} & (C extends 'ethereumSpecific'
  ? {
      feeSettings?: FeeSettings<'evm'>
      thirdPartyGasLimitEstimation?: bigint
    }
  : C extends 'utxoSpecific'
    ? { feeSettings?: FeeSettings<'utxo'>; psbt?: Psbt }
    : C extends 'cosmosSpecific'
      ? {
          timeoutTimestamp?: string
          transactionType?: TransactionType
          isDeposit?: boolean
        }
      : C extends 'thorchainSpecific'
        ? {
            isDeposit?: boolean
            transactionType?: TransactionType
          }
        : C extends 'mayaSpecific'
          ? {
              isDeposit?: boolean
            }
          : C extends 'tronSpecific'
            ? {
                expiration?: number
                timestamp?: number
                refBlockBytesHex?: string
                refBlockHashHex?: string
                thirdPartyGasLimitEstimation?: bigint
              }
            : {})

export type GetChainSpecificResolver<
  C extends KeysignChainSpecificKey = KeysignChainSpecificKey,
> = Resolver<GetChainSpecificInput<C>, Promise<ValueForCase<C>>>
