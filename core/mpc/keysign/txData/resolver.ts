import { Chain } from '@core/chain/Chain'
import { ChainKind, ChainOfKind } from '@core/chain/ChainKind'
import type { AccountCoin } from '@core/chain/coin/AccountCoin'
import type { TransactionType } from '@core/mpc/types/vultisig/keysign/v1/blockchain_specific_pb'
import { Resolver } from '@lib/utils/types/Resolver'
import type { Psbt } from 'bitcoinjs-lib'

import type { KeysignTxDataForChain } from '../txData/core'

export type KeysignTxDataResolverInput<
  K extends ChainKind = ChainKind,
  C extends Chain = ChainOfKind<K>,
> = {
  coin: AccountCoin<C>
  amount?: bigint
} & (K extends 'utxo'
  ? { psbt?: Psbt }
  : K extends 'cosmos'
    ? {
        timeoutTimestamp?: string
        transactionType?: TransactionType
        isDeposit?: boolean
      }
    : K extends 'solana'
      ? {
          receiver: string
        }
      : K extends 'tron'
        ? {
            expiration?: number
            timestamp?: number
            refBlockBytesHex?: string
            refBlockHashHex?: string
          }
        : {})

export type KeysignTxDataResolver<K extends ChainKind = ChainKind> = Resolver<
  KeysignTxDataResolverInput<K>,
  Promise<KeysignTxDataForChain<ChainOfKind<K>>>
>
