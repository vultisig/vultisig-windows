import { getFeeAmount } from '@core/mpc/keysign/fee'
import { getKeysignChain } from '@core/mpc/keysign/utils/getKeysignChain'
import { KeysignPayload } from '@core/mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { useMemo } from 'react'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVaultNullablePublicKey } from '../../../vault/state/currentVault'

export const useKeysignFee = (keysignPayload: KeysignPayload) => {
  const publicKey = useCurrentVaultNullablePublicKey(
    getKeysignChain(keysignPayload)
  )
  const walletCore = useAssertWalletCore()

  return useMemo(
    () =>
      getFeeAmount({
        keysignPayload,
        walletCore,
        publicKey,
      }),
    [keysignPayload, walletCore, publicKey]
  )
}
