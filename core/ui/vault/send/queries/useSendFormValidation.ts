import { extractAccountCoinKey } from '@core/chain/coin/AccountCoin'
import { areEqualRecords } from '@lib/utils/record/areEqualRecords'
import { useLayoutEffect, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { validateSendForm } from '../form/validateSendForm'
import { useSendAmount } from '../state/amount'
import { useSendFormFieldState } from '../state/formFields'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'

export const useSendFormValidation = () => {
  const { t } = useTranslation()

  const coin = useCurrentSendCoin()
  const [, setFormState] = useSendFormFieldState()
  const [amount] = useSendAmount()
  const [address] = useSendReceiver()
  const walletCore = useAssertWalletCore()
  const balanceQuery = useBalanceQuery(extractAccountCoinKey(coin))

  const errors = useMemo(
    () =>
      validateSendForm(
        { coin, amount, receiverAddress: address, senderAddress: coin.address },
        {
          balance: balanceQuery.data,
          walletCore,
          t,
        }
      ),
    [address, amount, balanceQuery.data, coin, t, walletCore]
  )

  useLayoutEffect(() => {
    setFormState(prev =>
      areEqualRecords(prev.errors, errors) ? prev : { ...prev, errors }
    )
  }, [errors, setFormState])

  const isPending = balanceQuery.isPending
  const isDisabled =
    isPending || Object.keys(errors).length > 0 || !coin || !amount || !address

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
    isPending,
    isDisabled,
  }
}
