import { Chain } from '@core/chain/Chain'
import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { TxStatusResolver } from './resolver'
import { getCardanoTxStatus } from './resolvers/cardano'
import { getCosmosTxStatus } from './resolvers/cosmos'
import { getEvmTxStatus } from './resolvers/evm'
import { getPolkadotTxStatus } from './resolvers/polkadot'
import { getRippleTxStatus } from './resolvers/ripple'
import { getSolanaTxStatus } from './resolvers/solana'
import { getSuiTxStatus } from './resolvers/sui'
import { getTonTxStatus } from './resolvers/ton'
import { getTronTxStatus } from './resolvers/tron'
import { getUtxoTxStatus } from './resolvers/utxo'

const statusHandlers: Record<ChainKind, TxStatusResolver<any>> = {
  cardano: getCardanoTxStatus,
  cosmos: getCosmosTxStatus,
  evm: getEvmTxStatus,
  polkadot: getPolkadotTxStatus,
  ripple: getRippleTxStatus,
  solana: getSolanaTxStatus,
  sui: getSuiTxStatus,
  ton: getTonTxStatus,
  utxo: getUtxoTxStatus,
  tron: getTronTxStatus,
}

type GetTxStatusInput = {
  chain: Chain
  hash: string
}

export const getTxStatus = (input: GetTxStatusInput) => {
  const { chain } = input
  const chainKind = getChainKind(chain)

  const handler = statusHandlers[chainKind]

  return handler(input)
}
