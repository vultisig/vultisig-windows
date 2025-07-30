import { Chain } from '@core/chain/Chain'
import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { WalletCore } from '@trustwallet/wallet-core'

import { broadcastTx } from '../broadcast'
import { decodeTx } from '../decode'
import { executeCardanoTx } from './cardano'
import { executeCosmosTx } from './cosmos'
import { executeEvmTx } from './evm'
import { ExecuteTxResolver } from './ExecuteTxResolver'
import { executePolkadotTx } from './polkadot'
import { executeRippleTx } from './ripple'
import { executeSolanaTx } from './solana'
import { executeSuiTx } from './sui'
import { executeTonTx } from './ton'
import { executeTronTx } from './tron'
import { executeUtxoTx } from './utxo'

const handlers: Record<ChainKind, ExecuteTxResolver<any>> = {
  cardano: executeCardanoTx,
  cosmos: executeCosmosTx,
  evm: executeEvmTx,
  polkadot: executePolkadotTx,
  ripple: executeRippleTx,
  solana: executeSolanaTx,
  sui: executeSuiTx,
  ton: executeTonTx,
  utxo: executeUtxoTx,
  tron: executeTronTx,
}

type ExecuteTxInput = {
  chain: Chain
  walletCore: WalletCore
  compiledTx: Uint8Array<ArrayBufferLike>
  skipBroadcast?: boolean
}

export const executeTx = async (input: ExecuteTxInput) => {
  const { chain, compiledTx, walletCore, skipBroadcast } = input
  const chainKind = getChainKind(chain)

  const tx = decodeTx({ chain, compiledTx })
  const handler = handlers[chainKind]

  const result = await handler({ chain, tx, walletCore })

  if (!skipBroadcast) {
    await broadcastTx({ chain, walletCore, tx })
  }

  return result
}
