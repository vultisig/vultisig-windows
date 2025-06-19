import { Chain, VaultBasedCosmosChain } from '@core/chain/Chain'
import { match } from '@lib/utils/match'

import { MAYAChainSpecific } from '../../../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { KeysignPayload } from '../../../../types/vultisig/keysign/v1/keysign_message_pb'
import { getBlockchainSpecificValue } from '../../../chainSpecific/KeysignChainSpecific'

export const getVaultBasedCosmosChainSpecific = (
  chain: VaultBasedCosmosChain,
  blockchainSpecific: KeysignPayload['blockchainSpecific']
) =>
  match<VaultBasedCosmosChain, Omit<MAYAChainSpecific, '$typeName'>>(chain, {
    [Chain.THORChain]: () =>
      getBlockchainSpecificValue(blockchainSpecific, 'thorchainSpecific'),
    [Chain.MayaChain]: () =>
      getBlockchainSpecificValue(blockchainSpecific, 'mayaSpecific'),
  })
