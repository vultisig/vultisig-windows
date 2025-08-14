import { ChainKind, getChainKind } from '@core/chain/ChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { getKeysignChain } from '../utils/getKeysignChain'
import { TxInputDataResolver } from './resolver'
import { getCardanoTxInputData } from './resolvers/cardano'
import { getCosmosTxInputData } from './resolvers/cosmos'
import { getEvmTxInputData } from './resolvers/evm'
import { getPolkadotTxInputData } from './resolvers/polkadot'
import { getRippleTxInputData } from './resolvers/ripple'
import { getSolanaTxInputData } from './resolvers/solana'
import { getSuiTxInputData } from './resolvers/sui'
import { getTonTxInputData } from './resolvers/ton'
import { getTronTxInputData } from './resolvers/tron'
import { getUtxoTxInputData } from './resolvers/utxo'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

const resolvers: Record<ChainKind, TxInputDataResolver<any>> = {
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

  return resolvers[chainKind]({
    ...input,
    chain,
  })
}
