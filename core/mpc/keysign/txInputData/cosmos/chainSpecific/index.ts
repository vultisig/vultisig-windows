import {
  Chain,
  CosmosChain,
  CosmosChainKind,
  VaultBasedCosmosChain,
} from '@core/chain/Chain'
import { getCosmosChainKind } from '@core/chain/chains/cosmos/utils/getCosmosChainKind'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { match } from '@lib/utils/match'

import {
  CosmosSpecific,
  MAYAChainSpecific,
  THORChainSpecific,
} from '../../../../types/vultisig/keysign/v1/blockchain_specific_pb'
import { getBlockchainSpecificValue } from '../../../chainSpecific/KeysignChainSpecific'

type VaultBasedCosmosChainSpecific = Omit<
  THORChainSpecific | MAYAChainSpecific,
  '$typeName'
>

type CosmosChainSpecific =
  | {
      ibcEnabled: CosmosSpecific
    }
  | { vaultBased: VaultBasedCosmosChainSpecific }

export const getCosmosChainSpecific = (
  chain: CosmosChain,
  blockchainSpecific: KeysignPayload['blockchainSpecific']
) => {
  const chainKind = getCosmosChainKind(chain)

  return match<CosmosChainKind, CosmosChainSpecific>(chainKind, {
    ibcEnabled: () => ({
      ibcEnabled: getBlockchainSpecificValue(
        blockchainSpecific,
        'cosmosSpecific'
      ),
    }),
    vaultBased: () => {
      const vaultChain = chain as VaultBasedCosmosChain

      return {
        vaultBased: match<
          VaultBasedCosmosChain,
          Omit<THORChainSpecific | MAYAChainSpecific, '$typeName'>
        >(vaultChain, {
          [Chain.THORChain]: () =>
            getBlockchainSpecificValue(blockchainSpecific, 'thorchainSpecific'),
          [Chain.MayaChain]: () =>
            getBlockchainSpecificValue(blockchainSpecific, 'mayaSpecific'),
        }),
      }
    },
  })
}
