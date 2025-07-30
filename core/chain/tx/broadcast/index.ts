import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { BroadcastTxResolver } from './BroadcastTxResolver'
import { broadcastCosmosTx } from './cosmos'
import { broadcastEvmTx } from './evm'
import { broadcastPolkadotTx } from './polkadot'
import { broadcastRippleTx } from './ripple'
import { broadcastSolanaTx } from './solana'
import { broadcastSuiTx } from './sui'
import { broadcastTonTx } from './ton'
import { broadcastTronTx } from './tron'
import { broadcastUtxoTx } from './utxo'

const handlers: Record<ChainKind, BroadcastTxResolver<any>> = {
  cardano: broadcastUtxoTx,
  cosmos: broadcastCosmosTx,
  evm: broadcastEvmTx,
  polkadot: broadcastPolkadotTx,
  ripple: broadcastRippleTx,
  solana: broadcastSolanaTx,
  sui: broadcastSuiTx,
  ton: broadcastTonTx,
  utxo: broadcastUtxoTx,
  tron: broadcastTronTx,
}

export const broadcastTx: BroadcastTxResolver = input =>
  handlers[getChainKind(input.chain)](input)
