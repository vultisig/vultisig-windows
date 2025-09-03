import { Chain } from '@core/chain/Chain'
import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { SigningOutput } from '../../tw/signingOutput'
import { TxHashResolver } from './resolver'
import { getCardanoTxHash } from './resolvers/cardano'
import { getCosmosTxHash } from './resolvers/cosmos'
import { getEvmTxHash } from './resolvers/evm'
import { getPolkadotTxHash } from './resolvers/polkadot'
import { getRippleTxHash } from './resolvers/ripple'
import { getSolanaTxHash } from './resolvers/solana'
import { getSuiTxHash } from './resolvers/sui'
import { getTonTxHash } from './resolvers/ton'
import { getTronTxHash } from './resolvers/tron'
import { getUtxoTxHash } from './resolvers/utxo'

const hashHandlers: Record<ChainKind, TxHashResolver<any>> = {
  cardano: getCardanoTxHash,
  cosmos: getCosmosTxHash,
  evm: getEvmTxHash,
  polkadot: getPolkadotTxHash,
  ripple: getRippleTxHash,
  solana: getSolanaTxHash,
  sui: getSuiTxHash,
  ton: getTonTxHash,
  utxo: getUtxoTxHash,
  tron: getTronTxHash,
}

type GetTxHashInput = {
  chain: Chain
  tx: SigningOutput<Chain>
}

export const getTxHash = (input: GetTxHashInput) => {
  const { chain, tx } = input
  const chainKind = getChainKind(chain)

  const handler = hashHandlers[chainKind]

  return handler(tx)
}
