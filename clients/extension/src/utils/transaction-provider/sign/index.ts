import { ChainKind, getChainKind } from '@core/chain/ChainKind'

import { getSignedCosmosTx } from './cosmos'
import { getSignedEvmTx } from './evm'

import { getSignedPolkadotTx } from './polkadot'
import { getSignedRippleTx } from './ripple'
import { getSignedSolanaTx } from './solana'
import { getSignedSuiTx } from './sui'
import { getSignedTonTx } from './ton'
import { getSignedUtxoTx } from './utxo'
import { GetSignedTxResolver } from './GetSignedTxResolver'

const handlers: Record<ChainKind, GetSignedTxResolver<any>> = {
  cosmos: getSignedCosmosTx,
  evm: getSignedEvmTx,
  polkadot: getSignedPolkadotTx,
  ripple: getSignedRippleTx,
  solana: getSignedSolanaTx,
  sui: getSignedSuiTx,
  ton: getSignedTonTx,
  utxo: getSignedUtxoTx,
}

export const getSignedTx: GetSignedTxResolver = input => {
  const chainKind = getChainKind(input.chain)

  const handler = handlers[chainKind]

  return handler(input)
}
