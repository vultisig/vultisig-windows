import { getSignedCosmosTx } from '@clients/extension/src/utils/tx/sign/cosmos'
import { getSignedEvmTx } from '@clients/extension/src/utils/tx/sign/evm'
import { GetSignedTxResolver } from '@clients/extension/src/utils/tx/sign/GetSignedTxResolver'
import { getSignedSolanaTx } from '@clients/extension/src/utils/tx/sign/solana'
import { getSignedUtxoTx } from '@clients/extension/src/utils/tx/sign/utxo'
import { ChainKind, getChainKind } from '@core/chain/ChainKind'

const handlers: Record<ChainKind, GetSignedTxResolver<any>> = {
  cosmos: getSignedCosmosTx,
  evm: getSignedEvmTx,
  polkadot: () => {
    throw new Error('polkadot getSigned handler not implemented')
  },
  solana: getSignedSolanaTx,
  ripple: () => {
    throw new Error('ripple getSigned handler not implemented')
  },
  sui: () => {
    throw new Error('sui getSigned handler not implemented')
  },
  ton: () => {
    throw new Error('ton getSigned handler not implemented')
  },
  utxo: getSignedUtxoTx,
  tron: () => {
    throw new Error('tron getSigned handler not implemented')
  },
}

export const getSignedTx: GetSignedTxResolver = input => {
  const chainKind = getChainKind(input.chain)

  const handler = handlers[chainKind]

  return handler(input)
}
