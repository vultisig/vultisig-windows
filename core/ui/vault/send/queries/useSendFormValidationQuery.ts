import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useSendFormFieldState } from '../providers/SendFormFieldStateProvider'
import { useSendAmount } from '../state/amount'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { isSendFormValidationError } from '../utils/isSendFormValidationError'
import { useSendChainSpecificQuery } from './useSendChainSpecificQuery'

export const useSendFormValidationQuery = () => {
  const [receiver] = useSendReceiver()
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const [, setFormState] = useSendFormFieldState()
  const coin = useCurrentVaultCoin(coinKey)
  const { t } = useTranslation()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))
  const chanSpecificQuery = useSendChainSpecificQuery()
  const [amount] = useSendAmount()
  const walletCore = useAssertWalletCore()

  const query = useTransformQueriesData(
    {
      balance: balanceQuery,
      chanSpecific: chanSpecificQuery,
    },
    useCallback(
      ({ balance }) => {
        if (!amount) {
          throw { message: t('amount_required'), field: 'amount' }
        }

        const maxAmount = fromChainAmount(balance, coin.decimals)

        if (amount > maxAmount) {
          throw { message: t('not_enough_for_gas'), field: 'amount' }
        }

        return null
      },
      [amount, coin.decimals, t]
    )
  )
  const addressError = useMemo(
    () =>
      !!receiver &&
      !isValidAddress({
        address: receiver,
        chain: coin.chain,
        walletCore,
      })
        ? {
            message: t('send_invalid_receiver_address'),
            field: 'address',
          }
        : undefined,
    [coin.chain, receiver, t, walletCore]
  )

  const { error } = query

  useEffect(() => {
    setFormState(prev => {
      const newErrors = { ...(prev.errors as Record<string, string>) }

      // Handle query (amount) error
      if (isSendFormValidationError(error)) {
        newErrors[error.field] = error.message
      } else {
        delete newErrors['amount']
      }

      // Handle address error
      if (addressError) {
        newErrors[addressError.field] = addressError.message
      } else {
        delete newErrors['address']
      }

      return {
        ...prev,
        errors: newErrors,
      }
    })
  }, [addressError, error, setFormState])

  return query
}
