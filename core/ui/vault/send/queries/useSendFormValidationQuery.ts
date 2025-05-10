import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecificQuery } from './useSendChainSpecificQuery'

export const useSendFormValidationQuery = () => {
  const [receiver] = useSendReceiver()
  const [{ coin: coinKey }] = useCurrentSendCoin()

  const { t } = useTranslation()
  const coin = useCurrentVaultCoin(coinKey)
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const chanSpecificQuery = useSendChainSpecificQuery()
  const [amount] = useSendAmount()

  const walletCore = useAssertWalletCore()

  return useTransformQueriesData(
    {
      balance: balanceQuery,
      chanSpecific: chanSpecificQuery,
    },
    useCallback(
      ({ balance }) => {
        if (
          !isValidAddress({
            address: receiver,
            chain: coin.chain,
            walletCore,
          })
        ) {
          throw new Error(t('send_invalid_receiver_address'))
        }

        if (!amount) {
          throw new Error(t('amount_required'))
        }

        const maxAmount = fromChainAmount(balance, coin.decimals)

        if (amount > maxAmount) {
          throw new Error(t('send_amount_exceeds_balance'))
        }

        return null
      },
      [amount, coin, receiver, t, walletCore]
    )
  )
}
