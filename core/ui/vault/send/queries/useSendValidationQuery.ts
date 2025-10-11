import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { validateSendForm } from '../form/validateSendForm'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendValidationQuery = () => {
  const { t } = useTranslation()

  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()
  const [address] = useSendReceiver()
  const walletCore = useAssertWalletCore()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  return useTransformQueryData(
    balanceQuery,
    useCallback(
      balance =>
        validateSendForm(
          {
            coin,
            amount,
            receiverAddress: address,
            senderAddress: coin.address,
          },
          {
            balance,
            walletCore,
            t,
          }
        ),
      [address, amount, coin, t, walletCore]
    )
  )
}
