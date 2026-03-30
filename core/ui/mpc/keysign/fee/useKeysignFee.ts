import { getFeeAmount } from '@vultisig/core-mpc/keysign/fee'
import { getKeysignChain } from '@vultisig/core-mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { getSignatureAlgorithm } from '../../../utils/getSignatureAlgorithm'
import { useCurrentVaultNullablePublicKey } from '../../../vault/state/currentVault'

export const useKeysignFee = (keysignPayload: KeysignPayload) => {
  const chain = getKeysignChain(keysignPayload)
  const publicKey = useCurrentVaultNullablePublicKey(chain)
  const walletCore = useAssertWalletCore()

  if (publicKey !== null) {
    return getFeeAmount({
      keysignPayload,
      walletCore,
      publicKey,
    })
  }

  if (getSignatureAlgorithm(chain) !== 'mldsa') {
    throw new Error('Missing WalletCore public key for fee estimation')
  }

  return getFeeAmount({
    keysignPayload,
    walletCore,
    // @ts-expect-error — SDK gap: getFeeAmount requires PublicKey; cosmos fee resolvers ignore it for MLDSA
    publicKey: null,
  })
}
