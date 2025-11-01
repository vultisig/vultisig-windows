import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import {
  buildSendKeysignPayload,
  BuildSendKeysignPayloadInput,
} from '@core/mpc/keysign/build/send'
import { getVaultId } from '@core/mpc/vault/Vault'
import { useBalanceQuery } from '@core/ui/chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import {
  useCurrentVault,
  useCurrentVaultPublicKey,
} from '@core/ui/vault/state/currentVault'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { shouldBePresent } from '@lib/utils/assert/shouldBePresent'
import { omit } from '@lib/utils/record/omit'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useFeeSettings } from '../fee/settings/state/feeSettings'
import { useSendAmount } from './amount'
import { useSendMemo } from './memo'
import { useSendReceiver } from './receiver'
import { useCurrentSendCoin } from './sendCoin'

export const useSendTxKeysignPayloadQuery = () => {
  const coin = useCurrentSendCoin()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const [amount] = useSendAmount()
  const [feeSettings] = useFeeSettings()

  const vault = useCurrentVault()

  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  const walletCore = useAssertWalletCore()
  const publicKey = useCurrentVaultPublicKey(coin.chain)

  const input: BuildSendKeysignPayloadInput = useMemo(
    () => ({
      coin,
      receiver,
      amount: shouldBePresent(amount),
      memo,
      vaultId: getVaultId(vault),
      localPartyId: vault.localPartyId,
      publicKey,
      libType: vault.libType,
      walletCore,
      balance: shouldBePresent(balanceQuery.data),
      feeSettings: feeSettings ?? undefined,
    }),
    [
      amount,
      balanceQuery.data,
      coin,
      feeSettings,
      memo,
      publicKey,
      receiver,
      vault,
      walletCore,
    ]
  )

  return useQuery({
    queryKey: [
      'sendTxKeysignPayload',
      omit(input, 'walletCore', 'publicKey', 'balance'),
    ],
    queryFn: () => buildSendKeysignPayload(input),
    ...noRefetchQueryOptions,
  })
}
