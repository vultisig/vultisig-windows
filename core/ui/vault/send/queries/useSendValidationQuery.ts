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
import { useIsSendFeePaidInCoin } from '../fee/useIsSendFeePaidInCoin'
import { getSendReceiverNameError } from '../form/getSendReceiverNameError'
import { validateSendForm } from '../form/validateSendForm'
import { useSendDestinationTagInput } from '../state/destinationTag'
import { useSendMemo } from '../state/memo'
import {
  getSendReceiverAddress,
  useSendReceiverResolution,
} from '../state/receiverResolution'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useNearSendLimitsQuery } from './useNearSendLimitsQuery'
import { useSendBalanceQuery } from './useSendBalanceQuery'
import { useSendFeeEstimateQuery } from './useSendFeeEstimateQuery'

/**
 * The send form's errors per field, pending until every input they depend on
 * is known — including the address a typed receiver name resolves to.
 */
export const useSendValidationQuery = () => {
  const { t } = useTranslation()

  const coin = useCurrentSendCoin()
  // A gasless TON jetton send pays the relay in the jetton, so the fee is
  // judged against the jetton balance and no TON is needed at all.
  const isFeePaidInCoin = useIsSendFeePaidInCoin()
  // XRPL issued currencies pay fees in XRP. Other token families may pay in
  // the token itself, so do not infer their fee asset from chainFeeCoin.
  const requiresNativeFee = isFeePaidInCoin || coin.chain === Chain.Ripple
  // The spendable amount, not the entered one: an entered amount that only
  // overshoots once the fee is added is adjusted down to what the balance
  // covers, and the send is committed at that amount — so the form must judge
  // the amount it will actually sign.
  const amount = useSpendableSendAmount()
  const [destinationTag] = useSendDestinationTagInput()
  const [memo] = useSendMemo()
  const receiver = useSendReceiverResolution()
  const walletCore = useAssertWalletCore()
  const balanceQuery = useSendBalanceQuery(extractAccountCoinKey(coin))
  const feeEstimateQuery = useSendFeeEstimateQuery()
  const nearSendLimitsQuery = useNearSendLimitsQuery()

  const nativeBalanceQuery = useSendBalanceQuery(
    extractAccountCoinKey({
      ...chainFeeCoin[coin.chain],
      address: coin.address,
    })
  )

  const validationQuery = useTransformQueryData(
    balanceQuery,
    useCallback(
      balance => {
        const errors = validateSendForm(
          {
            coin,
            amount,
            destinationTag,
            memo,
            receiverAddress: getSendReceiverAddress(receiver),
            senderAddress: coin.address,
          },
          {
            balance,
            walletCore,
            t,
            fee: requiresNativeFee ? feeEstimateQuery.data : undefined,
            nativeBalance: isFeePaidInCoin
              ? undefined
              : nativeBalanceQuery.data,
            isFeePaidInCoin,
          }
        )
        // A name without an address would otherwise read as an empty
        // receiver; name the reason instead.
        const receiverNameError = getSendReceiverNameError({
          receiver,
          chain: coin.chain,
          t,
        })

        return receiverNameError
          ? { ...errors, receiverAddress: receiverNameError }
          : errors
      },
      [
        amount,
        coin,
        destinationTag,
        feeEstimateQuery.data,
        isFeePaidInCoin,
        memo,
        nativeBalanceQuery.data,
        receiver,
        requiresNativeFee,
        t,
        walletCore,
      ]
    )
  )

  // A name still to be looked up has no address to judge yet.
  if (receiver.kind === 'pending' || receiver.kind === 'resolving') {
    return { ...validationQuery, data: undefined, isPending: true }
  }

  // XRP tokens need XRP for fees too. An unavailable balance/fee must not
  // briefly enable Continue or hide a failed funding check.
  if (
    requiresNativeFee &&
    validationQuery.data != null &&
    isRecordEmpty(validationQuery.data)
  ) {
    const fundingError =
      feeEstimateQuery.error ??
      (!isFeePaidInCoin ? nativeBalanceQuery.error : null)
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
      (!isFeePaidInCoin && nativeBalanceQuery.data == null)
    ) {
      return { ...validationQuery, data: undefined, isPending: true }
    }
  }

  // NEAR keeps a storage reserve back, known only once its limits load. Judging
  // the amount before then would let Continue pass on one the builder refuses.
  if (coin.chain === Chain.Near && isFeeCoin(coin)) {
    if (nearSendLimitsQuery.error) {
      return {
        ...validationQuery,
        data: undefined,
        error: nearSendLimitsQuery.error,
        isPending: false,
      }
    }
    if (nearSendLimitsQuery.data == null) {
      return { ...validationQuery, data: undefined, isPending: true }
    }
  }

  return validationQuery
}
