import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { BuildKeysignPayloadError } from '@core/mpc/keysign/error'
import { getSendFeeEstimate } from '@core/mpc/keysign/send/getSendFeeEstimate'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { omit } from '@lib/utils/record/omit'
import { useQuery } from '@tanstack/react-query'
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
  const publicKey = useCurrentVaultPublicKey(coin.chain)

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
      libType: vault.libType,
      walletCore,
    }
  }, [balance, coin, memo, publicKey, receiver, vault, walletCore])

  return useQuery({
    queryKey: [
      'sendFeeEstimate',
      input ? omit(input, 'walletCore', 'publicKey') : null,
    ],
    queryFn: () => getSendFeeEstimate(input!),
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
