import { Chain } from '@core/chain/Chain'
import { usdc } from '@core/chain/coin/knownTokens'
import { BuildKeysignPayloadError } from '@core/mpc/keysign/error'
import {
  buildSendKeysignPayload,
  BuildSendKeysignPayloadInput,
} from '@core/mpc/keysign/send/build'
import { toKeysignLibType } from '@core/mpc/types/utils/libType'
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

type UseCircleDepositKeysignPayloadQueryInput = {
  amount: bigint
}

export const useCircleDepositKeysignPayloadQuery = ({
  amount,
}: UseCircleDepositKeysignPayloadQueryInput) => {
  const address = useCurrentVaultAddress(Chain.Ethereum)
  const coin = useMemo(
    () => ({
      ...usdc,
      address,
    }),
    [address]
  )

  const { address: receiver } = useCircleAccount()

  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(Chain.Ethereum)

  const input: BuildSendKeysignPayloadInput = useMemo(
    () => ({
      coin,
      receiver,
      amount,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: toKeysignLibType(vault),
      walletCore,
    }),
    [amount, coin, publicKey, receiver, vault, walletCore]
  )

  return useQuery({
    queryKey: [
      'circleDepositKeysignPayload',
      omit(input, 'walletCore', 'publicKey'),
    ],
    queryFn: () => buildSendKeysignPayload(input),
    ...noRefetchQueryOptions,
    retry: (failureCount, error) => {
      if (error instanceof BuildKeysignPayloadError) {
        return false
      }
      return failureCount < 3
    },
  })
}
