import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { getKeysignChain } from '../../utils/getKeysignChain'
import { TxInputDataResolver } from '../resolver'
import { getCardanoTxInputData } from './cardano'
import { getCosmosTxInputData } from './cosmos'
import { getEvmTxInputData } from './evm'
import { getPolkadotTxInputData } from './polkadot'
import { getRippleTxInputData } from './ripple'
import { getSolanaTxInputData } from './solana'
import { getSuiTxInputData } from './sui'
import { getTonTxInputData } from './ton'
import { getTronTxInputData } from './tron'
import { getUtxoTxInputData } from './utxo'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

const handlers: Record<ChainKind, TxInputDataResolver<any>> = {
  cardano: getCardanoTxInputData,
  cosmos: getCosmosTxInputData,
  evm: getEvmTxInputData,
  polkadot: getPolkadotTxInputData,
  ripple: getRippleTxInputData,
  solana: getSolanaTxInputData,
  sui: getSuiTxInputData,
  ton: getTonTxInputData,
  utxo: getUtxoTxInputData,
  tron: getTronTxInputData,
}

export const getTxInputData = (input: Input) => {
  const { blockchainSpecific } = input.keysignPayload
  if (!blockchainSpecific.case) {
    throw new Error('Invalid blockchain specific')
  }

  const chain = getKeysignChain(input.keysignPayload)
  const chainKind = getChainKind(chain)

  return handlers[chainKind]({
    ...input,
    chain,
  })
}
