import { Chain } from '@core/chain/Chain'
import {
  buildCircleWithdrawKeysignPayload,
  BuildCircleWithdrawKeysignPayloadInput,
} from '@core/mpc/keysign/circleWithdraw/build'
import { BuildKeysignPayloadError } from '@core/mpc/keysign/error'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { useCurrentVaultAddress } from '@core/ui/vault/state/currentVaultCoins'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { omit } from '@lib/utils/record/omit'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useCircleAccount } from '../../queries/circleAccount'

type UseCircleWithdrawKeysignPayloadQueryInput = {
  amount: bigint
}

export const useCircleWithdrawKeysignPayloadQuery = ({
  amount,
}: UseCircleWithdrawKeysignPayloadQueryInput) => {
  const vaultAddress = useCurrentVaultAddress(Chain.Ethereum)
  const { address: mscaAddress } = useCircleAccount()

  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(Chain.Ethereum)

  const input: BuildCircleWithdrawKeysignPayloadInput = useMemo(
    () => ({
      vaultAddress,
      mscaAddress,
      amount,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: vault.libType,
      walletCore,
    }),
    [amount, mscaAddress, publicKey, vault, vaultAddress, walletCore]
  )

  return useQuery({
    queryKey: [
      'circleWithdrawKeysignPayload',
      omit(input, 'walletCore', 'publicKey'),
    ],
    queryFn: () => buildCircleWithdrawKeysignPayload(input),
    ...noRefetchQueryOptions,
    retry: (failureCount, error) => {
      if (error instanceof BuildKeysignPayloadError) {
        return false
      }
      return failureCount < 3
    },
  })
}
