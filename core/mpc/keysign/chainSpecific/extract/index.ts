import { Chain } from '@core/chain/Chain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'

import {
  KeysignChainSpecific,
  KeysignChainSpecificKey,
} from '../KeysignChainSpecific'
import {
  ExtractFeeQuoteByCaseResolver,
  ExtractFeeQuoteResolver,
} from './resolver'
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
  ExtractFeeQuoteByCaseResolver<any>
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

export const extractFeeQuote: ExtractFeeQuoteResolver<Chain> = ({
  chain,
  blockchainSpecific,
}) => {
  const hasCase = Boolean(
    (blockchainSpecific as KeysignPayload['blockchainSpecific']).case
  )
  const hasValue = Boolean(
    (blockchainSpecific as KeysignPayload['blockchainSpecific']).value
  )
  if (!hasCase || !hasValue) {
    throw new Error('Invalid blockchainSpecific in keysign payload')
  }

  const specific = blockchainSpecific as KeysignChainSpecific
  const resolver = resolvers[specific.case]
  return resolver({ chain, value: specific.value } as any)
}
