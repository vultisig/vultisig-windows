import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Chain } from '@vultisig/core-chain/Chain'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { isRecordEmpty } from '@vultisig/lib-utils/record/isRecordEmpty'
import { useCallback } from 'react'
import { useTranslation } from 'react-i18next'

import { useAssertWalletCore } from '../../../chain/providers/WalletCoreProvider'
import { useSpendableSendAmount } from '../amount/useSpendableSendAmount'
import { validateSendForm } from '../form/validateSendForm'
import { useSendDestinationTagInput } from '../state/destinationTag'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendBalanceQuery } from './useSendBalanceQuery'
import { useSendFeeEstimateQuery } from './useSendFeeEstimateQuery'

export const useSendValidationQuery = () => {
  const { t } = useTranslation()

  const coin = useCurrentSendCoin()
  // XRPL issued currencies pay fees in XRP. Other token families may pay in
  // the token itself, so do not infer their fee asset from chainFeeCoin.
  const requiresNativeFee = isFeeCoin(coin) || coin.chain === Chain.Ripple
  // The spendable amount, not the entered one: an entered amount that only
  // overshoots once the fee is added is adjusted down to what the balance
  // covers, and the send is committed at that amount — so the form must judge
  // the amount it will actually sign.
  const amount = useSpendableSendAmount()
  const [destinationTag] = useSendDestinationTagInput()
  const [address] = useSendReceiver()
  const walletCore = useAssertWalletCore()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const feeEstimateQuery = useSendFeeEstimateQuery()

  const nativeBalanceQuery = useSendBalanceQuery(
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
            fee: requiresNativeFee ? feeEstimateQuery.data : undefined,
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
        requiresNativeFee,
        t,
        walletCore,
      ]
    )
  )

  // XRP tokens need XRP for fees too. An unavailable balance/fee must not
  // briefly enable Continue or hide a failed funding check.
  if (
    requiresNativeFee &&
    validationQuery.data != null &&
    isRecordEmpty(validationQuery.data)
  ) {
    const fundingError =
      feeEstimateQuery.error ??
      (!isFeeCoin(coin) ? nativeBalanceQuery.error : null)
    if (fundingError) {
      return {
        ...validationQuery,
        data: undefined,
        error: fundingError,
        isPending: false,
      }
    }
    if (
      feeEstimateQuery.data == null ||
      (!isFeeCoin(coin) && nativeBalanceQuery.data == null)
    ) {
      return { ...validationQuery, data: undefined, isPending: true }
    }
  }

  return validationQuery
}
