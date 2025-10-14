import { Resolver } from '@lib/utils/types/Resolver'

import { ChainKind, ChainOfKind } from '../ChainKind'
import { AccountCoin } from '../coin/AccountCoin'
import { FeeQuote } from './core'

export type FeeQuoteResolverInput<K extends ChainKind = ChainKind> = {
  coin: AccountCoin<ChainOfKind<K>>
} & (K extends 'evm'
  ? {
      amount: bigint
      receiver: string
      data?: string
      thirdPartyGasLimitEstimation?: bigint
    }
  : K extends 'utxo'
    ? {
        isComplexTx?: boolean
      }
    : K extends 'tron'
      ? {
          thirdPartyGasLimitEstimation?: bigint
        }
      : {})

export type FeeQuoteResolver<K extends ChainKind = ChainKind> = Resolver<
  FeeQuoteResolverInput<K>,
  Promise<FeeQuote<K>>
>
