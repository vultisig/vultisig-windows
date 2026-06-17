import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import { BuildVultStakingKeysignPayloadInput } from '@vultisig/core-mpc/keysign/vultStaking/build'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'

import { vultStakingChain } from '../core/config'

/** Vault-derived fields shared by every VULT staking keysign payload builder. */
export const useVultStakingKeysignBase =
  (): BuildVultStakingKeysignPayloadInput => {
    const vaultAddress = useCurrentVaultAddress(vultStakingChain)
    const vault = useCurrentVault()
    const walletCore = useAssertWalletCore()
    const publicKey = useCurrentVaultPublicKey(vultStakingChain)

    return {
      vaultAddress,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: toKeysignLibType(vault),
      walletCore,
    }
  }

/** Don't retry deterministic build failures (e.g. not-enough-funds). */
export const keysignPayloadRetry = (failureCount: number, error: Error) => {
  if (error instanceof BuildKeysignPayloadError) {
    return false
  }
  return failureCount < 3
}
