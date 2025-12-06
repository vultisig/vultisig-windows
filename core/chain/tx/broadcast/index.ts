import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { BroadcastTxResolver } from './resolver'
import { broadcastCardanoTx } from './resolvers/cardano'
import { broadcastCosmosTx } from './resolvers/cosmos'
import { broadcastEvmTx } from './resolvers/evm'
import { broadcastPolkadotTx } from './resolvers/polkadot'
import { broadcastRippleTx } from './resolvers/ripple'
import { broadcastSolanaTx } from './resolvers/solana'
import { broadcastSuiTx } from './resolvers/sui'
import { broadcastTonTx } from './resolvers/ton'
import { broadcastTronTx } from './resolvers/tron'
import { broadcastUtxoTx } from './resolvers/utxo'

const resolvers: Record<ChainKind, BroadcastTxResolver<any>> = {
  cardano: broadcastCardanoTx,
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
  resolvers[getChainKind(input.chain)](input)
