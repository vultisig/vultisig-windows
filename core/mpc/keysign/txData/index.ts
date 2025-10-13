import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { KeysignTxDataForChain } from '../txData/core'
import { KeysignTxDataResolver, KeysignTxDataResolverInput } from './resolver'
import { getCardanoTxData } from './resolvers/cardano'
import { getCosmosTxData } from './resolvers/cosmos'
import { getEvmTxData } from './resolvers/evm'
import { getPolkadotTxData } from './resolvers/polkadot'
import { getRippleTxData } from './resolvers/ripple'
import { getSolanaTxData } from './resolvers/solana'
import { getSuiTxData } from './resolvers/sui'
import { getTonTxData } from './resolvers/ton'
import { getTronTxData } from './resolvers/tron'
import { getUtxoTxData } from './resolvers/utxo'

const resolvers: Record<ChainKind, KeysignTxDataResolver<any>> = {
  cardano: getCardanoTxData,
  cosmos: getCosmosTxData,
  evm: getEvmTxData,
  polkadot: getPolkadotTxData,
  ripple: getRippleTxData,
  solana: getSolanaTxData,
  sui: getSuiTxData,
  ton: getTonTxData,
  utxo: getUtxoTxData,
  tron: getTronTxData,
}

export const getKeysignTxData = async (
  input: KeysignTxDataResolverInput
): Promise<KeysignTxDataForChain> => {
  const kind = getChainKind(input.coin.chain)
  return resolvers[kind](input)
}
