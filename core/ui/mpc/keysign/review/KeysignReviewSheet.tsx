import {
  BlockaidRiskReview,
  BlockaidRiskReviewActions,
} from '@core/ui/chain/security/blockaid/tx/BlockaidRiskReview'
import { BlockaidTxScan } from '@core/ui/chain/security/blockaid/tx/BlockaidTxScan'
import { useBlockaidTxScanQuery } from '@core/ui/chain/security/blockaid/tx/queries/useBlockaidTxScanQuery'
import { useBoolean } from '@lib/ui/hooks/useBoolean'
import { OnCloseProp, TitleProp } from '@lib/ui/props'
import { Query } from '@lib/ui/query/Query'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { updateAtIndex } from '@vultisig/lib-utils/array/updateAtIndex'
import { match } from '@vultisig/lib-utils/match'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { RefetchableKeysignPayloadQuery } from '../start/refreshKeysignPayload'
import { resolveStartKeysignPromptProps } from '../start/resolveStartKeysignPromptProps'
import { StartKeysignPromptWithRefresh } from '../start/StartKeysignPromptWithRefresh'
import { ReviewBadgeTone, ReviewSheet } from './ReviewSheet'
import { ReviewTerms } from './ReviewTerms'
import { ReviewWarningBanner } from './ReviewWarningBanner'

type KeysignReviewSheetProps = OnCloseProp &
  TitleProp & {
    children: ReactNode
    /**
     * Must be refetchable: the payload is rebuilt when signing starts so the
     * builder's fail-closed gates run at sign time. See
     * {@link refreshKeysignPayload}.
     */
    keysignPayloadQuery: Query<KeysignPayload> &
      RefetchableKeysignPayloadQuery<KeysignPayload>
    /** Confirmations the user has to tick before the sign button enables. */
    terms?: string[]
    toAddressLabel?: string
    extraPendingMessage?: string
    /**
     * Blocks the start-keysign button with this message even when the payload
     * is ready. Use for pre-keysign gates such as an insufficient-funds check
     * that would otherwise waste an MPC ceremony on a transaction that can't
     * broadcast.
     */
    disabledMessage?: string
    /** Replaces the sign controls; the terms still render above it. */
    footer?: ReactNode
    swapQuote?: SwapQuote
  }

/**
 * The review step of a flow that starts a keysign, as a sheet over the form.
 * Runs the Blockaid scan against the payload: a flagged transaction takes over
 * the sheet with the verdict until the user backs out or knowingly continues,
 * exactly as the overlay did on the full-screen review. Closing the sheet
 * returns to the form.
 */
export const KeysignReviewSheet = ({
  title,
  onClose,
  children,
  keysignPayloadQuery,
  terms = [],
  toAddressLabel,
  extraPendingMessage,
  disabledMessage,
  footer,
  swapQuote,
}: KeysignReviewSheetProps) => {
  const { t } = useTranslation()

  const [termsAccepted, setTermsAccepted] = useState<boolean[]>(
    new Array(terms.length).fill(false)
  )

  const { data: scanResult, isScanning } =
    useBlockaidTxScanQuery(keysignPayloadQuery)
  const [isRiskDismissed, { set: dismissRisk }] = useBoolean(false)
  const flaggedTx = isRiskDismissed ? null : (scanResult ?? null)

  // The badge's ring reports the verdict; no verdict yet (or none possible)
  // leaves it off.
  const badgeTone: ReviewBadgeTone | undefined =
    scanResult === undefined
      ? undefined
      : scanResult === null
        ? 'safe'
        : match(scanResult.level, {
            medium: () => 'warning' as const,
            high: () => 'danger' as const,
          })

  const startKeysignPromptProps = resolveStartKeysignPromptProps({
    t,
    termsAccepted,
    keysignPayloadQuery,
    isScanning,
    extraPendingMessage,
    disabledMessage,
    toAddressLabel,
    swapQuote,
  })

  // The vault cannot cover this transaction as filled in, so there is nothing
  // to confirm or sign: say so, and leave the user to adjust the form.
  const isUnaffordable =
    keysignPayloadQuery.error instanceof BuildKeysignPayloadError &&
    keysignPayloadQuery.error.type === 'not-enough-funds'

  if (flaggedTx) {
    return (
      <ReviewSheet
        title={title}
        onClose={onClose}
        badgeTone={badgeTone}
        footer={
          <BlockaidRiskReviewActions
            onGoBack={onClose}
            onContinue={dismissRisk}
          />
        }
      >
        <BlockaidRiskReview value={flaggedTx} />
      </ReviewSheet>
    )
  }

  return (
    <ReviewSheet
      title={title}
      onClose={onClose}
      badgeTone={badgeTone}
      footer={
        isUnaffordable ? (
          <ReviewWarningBanner>
            {t('review_not_enough_funds')}
          </ReviewWarningBanner>
        ) : (
          <>
            {terms.length > 0 && (
              <ReviewTerms
                terms={terms}
                accepted={termsAccepted}
                onChange={(index, value) =>
                  setTermsAccepted(prev =>
                    updateAtIndex(prev, index, () => value)
                  )
                }
              />
            )}
            {footer ?? (
              <StartKeysignPromptWithRefresh
                keysignPayloadQuery={keysignPayloadQuery}
                toKeysignPayload={keysign => ({ keysign })}
                promptProps={startKeysignPromptProps}
              />
            )}
          </>
        )
      }
    >
      <BlockaidTxScan
        keysignPayloadQuery={keysignPayloadQuery}
        withOverlay={false}
      />
      {children}
    </ReviewSheet>
  )
}
