import { getVaultId } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { omit } from '@lib/utils/record/omit'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useReferralCoin } from '../hooks/useReferralCoin'
import {
  buildReferralKeysignPayload,
  BuildReferralKeysignPayloadInput,
} from './build'

export const useReferralKeysignPayloadQuery = ({
  memo,
  amount,
}: {
  memo: string
  amount: number
}) => {
  const vault = useCurrentVault()
  const coin = useReferralCoin()
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(coin.chain)

  const input: BuildReferralKeysignPayloadInput = useMemo(
    () => ({
      coin,
      memo,
      amount,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: vault.libType,
      walletCore,
    }),
    [amount, coin, memo, publicKey, vault, walletCore]
  )

  return useQuery({
    queryKey: [
      'referralKeysignPayload',
      omit(input, 'walletCore', 'publicKey'),
    ],
    queryFn: () => buildReferralKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}
