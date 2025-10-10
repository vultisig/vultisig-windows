import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { FeeQuoteResolver } from './resolver'
import { getCardanoFeeQuote } from './resolvers/cardano'
import { getCosmosFeeQuote } from './resolvers/cosmos'
import { getEvmFeeQuote } from './resolvers/evm'
import { getPolkadotFeeQuote } from './resolvers/polkadot'
import { getRippleFeeQuote } from './resolvers/ripple'
import { getSolanaFeeQuote } from './resolvers/solana'
import { getSuiFeeQuote } from './resolvers/sui'
import { getTonFeeQuote } from './resolvers/ton'
import { getTronFeeQuote } from './resolvers/tron'
import { getUtxoFeeQuote } from './resolvers/utxo'

const resolvers: Record<ChainKind, FeeQuoteResolver<any>> = {
  cardano: getCardanoFeeQuote,
  cosmos: getCosmosFeeQuote,
  evm: getEvmFeeQuote,
  polkadot: getPolkadotFeeQuote,
  ripple: getRippleFeeQuote,
  solana: getSolanaFeeQuote,
  sui: getSuiFeeQuote,
  ton: getTonFeeQuote,
  utxo: getUtxoFeeQuote,
  tron: getTronFeeQuote,
}

export const getFeeQuote: FeeQuoteResolver = async input =>
  resolvers[getChainKind(input.coin.chain)](input)
