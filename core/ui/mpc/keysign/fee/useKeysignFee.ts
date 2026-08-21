import { useQuery } from '@tanstack/react-query'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { getBlockchainSpecificValue } from '@vultisig/core-mpc/keysign/chainSpecific/KeysignChainSpecific'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVaultNullablePublicKey } from '../../../vault/state/currentVault'
import { getKeysignFeeAmount } from './tronMemoFee'

export const useKeysignFee = (keysignPayload: KeysignPayload) => {
  const chain = getKeysignChain(keysignPayload)
  const publicKey = useCurrentVaultNullablePublicKey(chain)
  const walletCore = useAssertWalletCore()

  return useQuery({
    queryKey: ['keysignFee', keysignPayload, publicKey, walletCore],
    queryFn: () => {
      if (publicKey !== null) {
        return getKeysignFeeAmount({
          keysignPayload,
          walletCore,
          publicKey,
        })
      }

      if (getChainKind(chain) !== 'qbtc') {
        throw new Error('Missing WalletCore public key for fee estimation')
      }

      const cosmosSpecific = getBlockchainSpecificValue(
        keysignPayload.blockchainSpecific,
        'cosmosSpecific'
      )
      return cosmosSpecific.gas
    },
  })
}
