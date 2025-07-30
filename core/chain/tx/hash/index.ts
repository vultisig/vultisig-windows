import { Chain } from '@core/chain/Chain'
import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { DecodedTx } from '../decode'
import { getCardanoTxHash } from './cardano'
import { getCosmosTxHash } from './cosmos'
import { getEvmTxHash } from './evm'
import { TxHashResolver } from './TxHashResolver'
import { getPolkadotTxHash } from './polkadot'
import { getRippleTxHash } from './ripple'
import { getSolanaTxHash } from './solana'
import { getSuiTxHash } from './sui'
import { getTonTxHash } from './ton'
import { getTronTxHash } from './tron'
import { getUtxoTxHash } from './utxo'

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
  tx: DecodedTx<Chain>
}

export const getTxHash = (input: GetTxHashInput) => {
  const { chain, tx } = input
  const chainKind = getChainKind(chain)

  const handler = hashHandlers[chainKind]

  return handler(tx)
}
