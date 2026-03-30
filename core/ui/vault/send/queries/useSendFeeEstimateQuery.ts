import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultNullablePublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useQuery } from '@tanstack/react-query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import { getSendFeeEstimate } from '@vultisig/core-mpc/keysign/send/getSendFeeEstimate'
import { toKeysignLibType } from '@vultisig/core-mpc/types/utils/libType'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { omit } from '@vultisig/lib-utils/record/omit'
import { useMemo } from 'react'

import { useSendMemo } from '../state/memo'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendFeeEstimateQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()

  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const balance = balanceQuery.data

  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultNullablePublicKey(coin.chain)

  const input = useMemo(() => {
    if (balance == null) return null

    return {
      coin,
      receiver,
      amount: balance,
      memo,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: toKeysignLibType(vault),
      walletCore,
      hexPublicKeyOverride: publicKey ? undefined : vault.publicKeyMldsa,
    }
  }, [balance, coin, memo, publicKey, receiver, vault, walletCore])

  return useQuery({
    queryKey: [
      'sendFeeEstimate',
      input ? omit(input, 'walletCore', 'publicKey') : null,
    ],
    queryFn: () => {
      // @ts-expect-error — SDK gap: BuildSendKeysignPayloadInput omits hexPublicKeyOverride and requires non-null PublicKey; Windows supports MLDSA send
      return getSendFeeEstimate(input!)
    },
    enabled: !!receiver && balance != null && input != null,
    ...noRefetchQueryOptions,
    retry: (failureCount, error) => {
      if (error instanceof BuildKeysignPayloadError) {
        return false
      }

      return failureCount < 3
    },
  })
}
