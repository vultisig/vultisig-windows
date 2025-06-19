import {
  CosmosChain,
  CosmosChainKind,
  VaultBasedCosmosChain,
} from '@core/chain/Chain'
import { getCosmosChainKind } from '@core/chain/chains/cosmos/utils/getCosmosChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { match } from '@lib/utils/match'

import { CosmosSpecific } from '../../../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { getBlockchainSpecificValue } from '../../../chainSpecific/KeysignChainSpecific'
import { getVaultBasedCosmosChainSpecific } from './vaultBased'

export const getCosmosSharedChainSpecific = (
  chain: CosmosChain,
  blockchainSpecific: KeysignPayload['blockchainSpecific']
) => {
  const chainKind = getCosmosChainKind(chain)

  return match<
    CosmosChainKind,
    Omit<CosmosSpecific, '$typeName' | 'gas' | 'transactionType'>
  >(chainKind, {
    ibcEnabled: () =>
      getBlockchainSpecificValue(blockchainSpecific, 'cosmosSpecific'),
    vaultBased: () =>
      getVaultBasedCosmosChainSpecific(
        chain as VaultBasedCosmosChain,
        blockchainSpecific
      ),
  })
}
