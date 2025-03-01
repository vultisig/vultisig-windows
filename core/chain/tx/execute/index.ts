import { ChainKind, getChainKind } from '@core/chain/ChainKind'

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

export const executeTx: ExecuteTxResolver = input => {
  const chainKind = getChainKind(input.chain)

  const handler = handlers[chainKind]

  return handler(input)
}
