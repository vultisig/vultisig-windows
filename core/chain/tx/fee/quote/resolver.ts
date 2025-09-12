import { Resolver } from '@lib/utils/types/Resolver'

import { Chain } from '../../../Chain'
import { ChainKind, ChainOfKind } from '../../../ChainKind'
import { AccountCoin } from '../../../coin/AccountCoin'
import { FeeQuote } from './core'

export type FeeQuoteInput<T extends Chain = Chain> = {
  coin: AccountCoin<T>
  receiver?: string
  amount?: number
  data?: `0x${string}` | undefined
}

export type FeeQuoteResolver<T extends Chain = Chain> = Resolver<
  FeeQuoteInput<T>,
  Promise<FeeQuote<ChainKind>>
>

export type AnyFeeQuoteResolver = FeeQuoteResolver<Chain>

export type FeeQuoteResolversByKind = {
  evm: FeeQuoteResolver<ChainOfKind<'evm'>>
  utxo: FeeQuoteResolver<ChainOfKind<'utxo'>>
  cosmos: FeeQuoteResolver<ChainOfKind<'cosmos'>>
  solana: FeeQuoteResolver<ChainOfKind<'solana'>>
  sui: FeeQuoteResolver<ChainOfKind<'sui'>>
  polkadot: FeeQuoteResolver<ChainOfKind<'polkadot'>>
  ton: FeeQuoteResolver<ChainOfKind<'ton'>>
  ripple: FeeQuoteResolver<ChainOfKind<'ripple'>>
  tron: FeeQuoteResolver<ChainOfKind<'tron'>>
  cardano: FeeQuoteResolver<ChainOfKind<'cardano'>>
}
