import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useTransactionRecords } from '@core/ui/storage/transactionHistory'
import { Button } from '@lib/ui/buttons/Button'
import { LimitSwapCancelBlocker } from '@vultisig/core-chain/swap/native/limitSwapCancelEligibility'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { LimitSwapTransactionRecord } from '../../../../transaction-history/core'
import { DisabledCancelButton } from './DisabledCancelButton'
import { useLimitOrderCancel } from './useLimitOrderCancel'

/**
 * Which blockers are worth explaining, and with what.
 *
 * `terminal` is deliberately absent: a closed order has nothing to cancel and
 * the status row above already says so, so it renders no button at all. Every
 * other blocker is permanent for a given order and genuinely explainable, and an
 * absent button would just send the user hunting for a reason.
 */
const cancelBlockerTranslationKey = {
  cancelAlreadyBroadcast: 'swap_limit_cancel_already_requested',
  missingSignedData: 'swap_limit_cancel_unavailable_legacy_order',
  signedDataDisagreesWithChain: 'swap_limit_cancel_unavailable_mismatch',
  memoTooLongForSourceChain: 'swap_limit_cancel_unavailable_memo_too_long',
  unroutableSourceChain: 'swap_limit_cancel_unavailable_chain',
} as const satisfies Record<Exclude<LimitSwapCancelBlocker, 'terminal'>, string>

type LimitOrderCancelButtonProps = {
  record: LimitSwapTransactionRecord
}

/**
 * The entry point for cancelling a resting limit order.
 *
 * Disabled-with-a-reason throughout rather than enabled-and-inert: a cancel that
 * silently does nothing is unrecoverable, because nothing on screen would say
 * why. The reason sits under the button rather than in a tooltip — several of
 * these are the user's only route to understanding why an order they want closed
 * has to sit out its expiry instead.
 */
export const LimitOrderCancelButton: FC<LimitOrderCancelButtonProps> = ({
  record,
}) => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const records = useTransactionRecords()

  const cancel = useLimitOrderCancel({ record, records })

  if ('blocked' in cancel) {
    if (cancel.blocked === 'terminal') {
      return null
    }

    return (
      <DisabledCancelButton
        reason={t(cancelBlockerTranslationKey[cancel.blocked])}
      />
    )
  }

  if ('missingSigningCoin' in cancel) {
    const { ticker, chain } = cancel.missingSigningCoin

    return (
      <DisabledCancelButton
        reason={t('swap_limit_cancel_unavailable_no_signing_asset', {
          ticker,
          chain,
        })}
      />
    )
  }

  return (
    <Button
      kind="secondary"
      onClick={() =>
        navigate({ id: 'cancelLimitOrder', state: { id: record.id } })
      }
    >
      {t('swap_limit_cancel_title')}
    </Button>
  )
}
