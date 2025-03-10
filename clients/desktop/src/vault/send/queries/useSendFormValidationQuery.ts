import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { isValidAddress } from '../../../chain/utils/isValidAddress'
import { useBalanceQuery } from '../../../coin/query/useBalanceQuery'
import { useTransformQueriesData } from '../../../lib/ui/query/hooks/useTransformQueriesData'
import { useAssertWalletCore } from '../../../providers/WalletCoreProvider'
import { useCurrentVaultCoin } from '../../state/currentVault'
import { useSender } from '../sender/hooks/useSender'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecificQuery } from './useSendChainSpecificQuery'

export const useSendFormValidationQuery = () => {
  const [receiver] = useSendReceiver()
  const [coinKey] = useCurrentSendCoin()

  const { t } = useTranslation()
  const coin = useCurrentVaultCoin(coinKey)
  const balanceQuery = useBalanceQuery(coin)
  const chanSpecificQuery = useSendChainSpecificQuery()
  const [amount] = useSendAmount()

  const walletCore = useAssertWalletCore()

  const senderAddress = useSender()

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

        if (
          coin.chain == Chain.Tron &&
          coin.ticker == chainFeeCoin[Chain.Tron].ticker &&
          receiver === senderAddress
        ) {
          throw new Error(t('same_sender_receiver_error'))
        }

        return null
      },
      [amount, coin, receiver, senderAddress, t, walletCore]
    )
  )
}
