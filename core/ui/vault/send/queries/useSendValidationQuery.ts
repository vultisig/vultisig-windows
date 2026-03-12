import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { isFeeCoin } from '@core/chain/coin/utils/isFeeCoin'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { validateSendForm } from '../form/validateSendForm'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendFeeEstimateQuery } from './useSendFeeEstimateQuery'

export const useSendValidationQuery = () => {
  const { t } = useTranslation()

  const coin = useCurrentSendCoin()
  const [amount] = useSendAmount()
  const [address] = useSendReceiver()
  const walletCore = useAssertWalletCore()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const feeEstimateQuery = useSendFeeEstimateQuery()

  const nativeBalanceQuery = useBalanceQuery(
    extractAccountCoinKey({
      ...chainFeeCoin[coin.chain],
      address: coin.address,
    })
  )

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
            fee: isFeeCoin(coin) ? feeEstimateQuery.data : undefined,
            nativeBalance: isFeeCoin(coin)
              ? undefined
              : nativeBalanceQuery.data,
          }
        ),
      [
        address,
        amount,
        coin,
        feeEstimateQuery.data,
        nativeBalanceQuery.data,
        t,
        walletCore,
      ]
    )
  )
}
