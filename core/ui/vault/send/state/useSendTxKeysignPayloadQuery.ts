import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { buildSendKeysignPayload } from '@core/mpc/keysign/build/send'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { omit } from '@lib/utils/record/omit'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useSendAmount } from './amount'
import { useSendMemo } from './memo'
import { useSendReceiver } from './receiver'
import { useCurrentSendCoin } from './sendCoin'

export const useSendTxKeysignPayloadQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const [amount] = useSendAmount()

  const vault = useCurrentVault()

  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  const walletCore = useAssertWalletCore()

  const input = useMemo(
    () => ({
      coin,
      receiver,
      amount: shouldBePresent(amount),
      memo,
      vault: {
        hexChainCode: vault.hexChainCode,
        publicKeys: vault.publicKeys,
        localPartyId: vault.localPartyId,
        libType: vault.libType,
      },
      walletCore,
      balance: shouldBePresent(balanceQuery.data),
    }),
    [
      coin,
      receiver,
      amount,
      memo,
      vault.hexChainCode,
      vault.localPartyId,
      vault.libType,
      vault.publicKeys,
      walletCore,
      balanceQuery.data,
    ]
  )

  const queryKey = useMemo(
    () => ['sendTxKeysignPayload', omit(input, 'walletCore', 'balance')],
    [input]
  )

  return useQuery({
    queryKey,
    queryFn: () => buildSendKeysignPayload(input),
    ...noRefetchQueryOptions,
    enabled: amount !== null && balanceQuery.data !== undefined,
  })
}
