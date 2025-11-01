import { FeeSettings } from '@core/chain/feeQuote/settings/core'
import type { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import { Psbt } from 'bitcoinjs-lib'

import { KeysignPayload } from '../../types/vultisig/keysign/v1/keysign_message_pb'
import {
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from './KeysignChainSpecific'

type ValueForCase<C extends KeysignChainSpecificKey> = Extract<
  KeysignChainSpecific,
  { case: C }
>['value']

type GetChainSpecificInput<C extends KeysignChainSpecificKey> = {
  keysignPayload: KeysignPayload
} & (C extends 'ethereumSpecific'
  ? { feeSettings?: FeeSettings<'evm'> }
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
              }
            : {})

export type GetChainSpecificResolver<C extends KeysignChainSpecificKey> =
  Resolver<GetChainSpecificInput<C>, Promise<ValueForCase<C>>>
