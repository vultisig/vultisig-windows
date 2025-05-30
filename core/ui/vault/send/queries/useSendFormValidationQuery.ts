import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { isValidAddress } from '@core/chain/utils/isValidAddress'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { areEqualRecords } from '@lib/utils/record/areEqualRecords'
import { useCallback, useEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useSendAmount } from '../state/amount'
import { useSendFormFieldState } from '../state/formFields'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
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

  const errors = useMemo(() => {
    const res: Record<string, string> = {}

    if (!amount) {
      res.amount = t('amount_required')
    } else {
      const max = fromChainAmount(balanceQuery.data ?? '0', coin.decimals)
      if (amount > max) res.amount = t('not_enough_for_gas')
    }

    if (
      receiver &&
      !isValidAddress({ address: receiver, chain: coin.chain, walletCore })
    ) {
      res.address = t('send_invalid_receiver_address')
    }

    return res
  }, [
    amount,
    balanceQuery.data,
    coin.decimals,
    coin.chain,
    receiver,
    walletCore,
    t,
  ])

  const setErrors = useCallback(() => {
    setFormState(prev => {
      if (areEqualRecords(prev.errors, errors)) return prev
      return { ...prev, errors }
    })
  }, [errors, setFormState])

  useEffect(setErrors, [setErrors])

  return {
    isLoading: query.isLoading,
    isPending: query.isPending,
  }
}
