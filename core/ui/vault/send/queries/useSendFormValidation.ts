import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { validateSendForm } from '../form/validateSendForm'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendFormValidation = () => {
  const { t } = useTranslation()

  const [{ coin: coinKey }] = useCurrentSendCoin()

  const [amount] = useSendAmount()
  const [address] = useSendReceiver()
  const coin = useCurrentVaultCoin(coinKey)
  const walletCore = useAssertWalletCore()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  const errors = useMemo(
    () =>
      validateSendForm(
        { coin, amount, address },
        {
          balance: balanceQuery.data,
          balanceReady: !balanceQuery.isLoading && !balanceQuery.isPending,
          coinDecimals: coin.decimals,
          chain: coin.chain,
          walletCore,
          t,
        }
      ),
    [
      address,
      amount,
      balanceQuery.data,
      balanceQuery.isLoading,
      balanceQuery.isPending,
      coin,
      t,
      walletCore,
    ]
  )

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    isLoading: balanceQuery.isLoading,
    isPending: balanceQuery.isPending,
  }
}
