import { Chain } from '@core/chain/Chain'
import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { WalletCore } from '@trustwallet/wallet-core'

import { DecodedTx } from '../decode'
import { BroadcastTxResolver } from './BroadcastTxResolver'
import { broadcastCardanoTx } from './cardano'
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

type BroadcastTxInput = {
  chain: Chain
  walletCore: WalletCore
  tx: DecodedTx<Chain>
}

export const broadcastTx = (input: BroadcastTxInput) => {
  const { chain, ...rest } = input
  const chainKind = getChainKind(chain)

  const handler = handlers[chainKind]

  return handler({ chain, ...rest })
}
