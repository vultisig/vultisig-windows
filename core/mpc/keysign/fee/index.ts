import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { getKeysignChain } from '../utils/getKeysignChain'
import { GetFeeAmountResolver } from './resolver'
import { getCardanoFeeAmount } from './resolvers/cardano'
import { getCosmosFeeAmount } from './resolvers/cosmos'
import { getEvmFeeAmount } from './resolvers/evm'
import { getPolkadotFeeAmount } from './resolvers/polkadot'
import { getRippleFeeAmount } from './resolvers/ripple'
import { getSolanaFeeAmount } from './resolvers/solana'
import { getSuiFeeAmount } from './resolvers/sui'
import { getTonFeeAmount } from './resolvers/ton'
import { getTronFeeAmount } from './resolvers/tron'
import { getUtxoFeeAmount } from './resolvers/utxo'

const resolvers: Record<ChainKind, GetFeeAmountResolver> = {
  cardano: getCardanoFeeAmount,
  cosmos: getCosmosFeeAmount,
  evm: getEvmFeeAmount,
  polkadot: getPolkadotFeeAmount,
  ripple: getRippleFeeAmount,
  solana: getSolanaFeeAmount,
  sui: getSuiFeeAmount,
  ton: getTonFeeAmount,
  utxo: getUtxoFeeAmount,
  tron: getTronFeeAmount,
}

export const getFeeAmount: GetFeeAmountResolver = keysignPayload => {
  const chain = getKeysignChain(keysignPayload)
  const kind = getChainKind(chain)
  return resolvers[kind](keysignPayload)
}
