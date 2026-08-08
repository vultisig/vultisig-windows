import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useBalanceQuery } from '../../../chain/coin/queries/useBalanceQuery'
import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useSpendableSendAmount } from '../amount/useSpendableSendAmount'
import { validateSendForm } from '../form/validateSendForm'
import { useSendDestinationTagInput } from '../state/destinationTag'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendFeeEstimateQuery } from './useSendFeeEstimateQuery'

export const useSendValidationQuery = () => {
  const { t } = useTranslation()

  const coin = useCurrentSendCoin()
  // The spendable amount, not the entered one: an entered amount that only
  // overshoots once the fee is added is adjusted down to what the balance
  // covers, and the send is committed at that amount — so the form must judge
  // the amount it will actually sign.
  const amount = useSpendableSendAmount()
  const [destinationTag] = useSendDestinationTagInput()
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

  const validationQuery = useTransformQueryData(
    balanceQuery,
    useCallback(
      balance =>
        validateSendForm(
          {
            coin,
            amount,
            destinationTag,
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
        destinationTag,
        feeEstimateQuery.data,
        nativeBalanceQuery.data,
        t,
        walletCore,
      ]
    )
  )

  // A fee-coin send can't be validated until its fee is known. While the fee
  // estimate is still loading, keep the form pending instead of reporting it
  // as valid — otherwise Continue briefly enables (e.g. amount === balance,
  // where the verdict flips once the fee arrives and amount + fee exceeds
  // balance).
  const isFeeRequiredButUnknown =
    isFeeCoin(coin) &&
    feeEstimateQuery.data == null &&
    feeEstimateQuery.error == null

  if (
    isFeeRequiredButUnknown &&
    validationQuery.data != null &&
    isRecordEmpty(validationQuery.data)
  ) {
    return { ...validationQuery, data: undefined, isPending: true }
  }

  return validationQuery
}
