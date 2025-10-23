import {
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from '../KeysignChainSpecific'
import { ExtractFeeQuoteResolver } from './resolver'
import { extractCardanoFeeQuote } from './resolvers/cardano'
import { extractCosmosFeeQuote } from './resolvers/cosmos'
import { extractEvmFeeQuote } from './resolvers/evm'
import { extractMayaFeeQuote } from './resolvers/maya'
import { extractPolkadotFeeQuote } from './resolvers/polkadot'
import { extractRippleFeeQuote } from './resolvers/ripple'
import { extractSolanaFeeQuote } from './resolvers/solana'
import { extractSuiFeeQuote } from './resolvers/sui'
import { extractThorchainFeeQuote } from './resolvers/thor'
import { extractTonFeeQuote } from './resolvers/ton'
import { extractTronFeeQuote } from './resolvers/tron'
import { extractUtxoFeeQuote } from './resolvers/utxo'

const resolvers: Record<
  KeysignChainSpecificKey,
  ExtractFeeQuoteResolver<any>
> = {
  ethereumSpecific: extractEvmFeeQuote,
  utxoSpecific: extractUtxoFeeQuote,
  thorchainSpecific: extractThorchainFeeQuote,
  mayaSpecific: extractMayaFeeQuote,
  cosmosSpecific: extractCosmosFeeQuote,
  solanaSpecific: extractSolanaFeeQuote,
  rippleSpecific: extractRippleFeeQuote,
  polkadotSpecific: extractPolkadotFeeQuote,
  suicheSpecific: extractSuiFeeQuote,
  tonSpecific: extractTonFeeQuote,
  tronSpecific: extractTronFeeQuote,
  cardano: extractCardanoFeeQuote,
}

export const extractFeeQuote = (value: KeysignChainSpecific) =>
  resolvers[value.case](value.value)
