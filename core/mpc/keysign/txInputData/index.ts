import { KeysignChainSpecificKey } from '@core/mpc/keysign/chainSpecific/KeysignChainSpecific'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { WalletCore } from '@trustwallet/wallet-core'

import { getKeysignChain } from '../utils/getKeysignChain'
import { getCosmosTxInputData } from './cosmos'
import { getEvmTxInputData } from './evm'
import { getMayaTxInputData } from './maya'
import { getPolkadotTxInputData } from './polkadot'
import { getRippleTxInputData } from './ripple'
import { getSolanaTxInputData } from './solana'
import { getSuiTxInputData } from './sui'
import { getThorTxInputData } from './thor'
import { getTonTxInputData } from './ton'
import { getTronTxInputData } from './tron'
import { TxInputDataResolver } from './TxInputDataResolver'
import { getUtxoTxInputData } from './utxo'

type Input = {
  keysignPayload: KeysignPayload
  walletCore: WalletCore
}

const handlers: Record<KeysignChainSpecificKey, TxInputDataResolver<any>> = {
  cosmosSpecific: getCosmosTxInputData,
  ethereumSpecific: getEvmTxInputData,
  mayaSpecific: getMayaTxInputData,
  polkadotSpecific: getPolkadotTxInputData,
  rippleSpecific: getRippleTxInputData,
  solanaSpecific: getSolanaTxInputData,
  suicheSpecific: getSuiTxInputData,
  thorchainSpecific: getThorTxInputData,
  tonSpecific: getTonTxInputData,
  utxoSpecific: getUtxoTxInputData,
  tronSpecific: getTronTxInputData,
}

export const getTxInputData = (input: Input) => {
  const { blockchainSpecific } = input.keysignPayload
  if (!blockchainSpecific.case) {
    throw new Error('Invalid blockchain specific')
  }

  const chain = getKeysignChain(input.keysignPayload)

  const chainSpecificHandler = handlers[blockchainSpecific.case]

  return chainSpecificHandler({
    ...input,
    chain,
  })
}
