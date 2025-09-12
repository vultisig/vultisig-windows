// no need for Chain type here
import { getChainKind } from '../../../ChainKind'
import { cardanoDefaultFee } from '../../../chains/cardano/config'
import { polkadotConfig } from '../../../chains/polkadot/config'
import { tonConfig } from '../../../chains/ton/config'
import { rippleTxFee } from '../ripple'
import { AnyFeeQuoteResolver, FeeQuoteResolversByKind } from './resolver'
import { getCosmosFeeQuote } from './resolvers/cosmos'
import { getEvmFeeQuote } from './resolvers/evm'
import { getSolanaFeeQuote } from './resolvers/solana'
import { getSuiFeeQuote } from './resolvers/sui'
import { getTronFeeQuote } from './resolvers/tron'
import { getUtxoFeeQuote } from './resolvers/utxo'

const resolversByKind: FeeQuoteResolversByKind = {
  evm: getEvmFeeQuote,
  utxo: getUtxoFeeQuote,
  cosmos: getCosmosFeeQuote,
  solana: getSolanaFeeQuote,
  sui: getSuiFeeQuote,
  tron: getTronFeeQuote,
  ripple: async () => rippleTxFee,
  polkadot: async () => polkadotConfig.fee,
  ton: async () => tonConfig.fee,
  cardano: async () => cardanoDefaultFee,
}

const resolversByKindAny = resolversByKind as unknown as Record<
  keyof typeof resolversByKind,
  AnyFeeQuoteResolver
>

export const getFeeQuote: AnyFeeQuoteResolver = async input => {
  const kind = getChainKind(input.coin.chain)
  return resolversByKindAny[kind](input)
}
