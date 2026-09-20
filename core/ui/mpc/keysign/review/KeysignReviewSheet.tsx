import { equals } from '@bufbuild/protobuf'
import { OnCloseProp, TitleProp } from '@lib/ui/props'
import { Query } from '@lib/ui/query/Query'
import { RiskLevel } from '@vultisig/core-chain/security/blockaid/core/riskLevel'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import {
  KeysignPayload,
  KeysignPayloadSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { updateAtIndex } from '@vultisig/lib-utils/array/updateAtIndex'
import { match } from '@vultisig/lib-utils/match'
import { ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'

import {
  BlockaidRiskReview,
  BlockaidRiskReviewActions,
} from '../../../chain/security/blockaid/tx/BlockaidRiskReview'
import { BlockaidTxScan } from '../../../chain/security/blockaid/tx/BlockaidTxScan'
import { BlockaidTxScanResult } from '../../../chain/security/blockaid/tx/queries/blockaidTxValidation'
import { useBlockaidTxScanQuery } from '../../../chain/security/blockaid/tx/queries/useBlockaidTxScanQuery'
import { RefetchableKeysignPayloadQuery } from '../start/refreshKeysignPayload'
import { resolveStartKeysignPromptProps } from '../start/resolveStartKeysignPromptProps'
import { StartKeysignPromptWithRefresh } from '../start/StartKeysignPromptWithRefresh'
import { ReviewBadgeTone, ReviewSheet } from './ReviewSheet'
import { ReviewTerms } from './ReviewTerms'
import { ReviewWarningBanner } from './ReviewWarningBanner'

const getReviewBadgeTone = (
  scanResult: BlockaidTxScanResult | undefined
): ReviewBadgeTone | undefined => {
  if (scanResult === undefined) return undefined
  if (scanResult === null) return 'safe'

  return match<RiskLevel, ReviewBadgeTone>(scanResult.level, {
    medium: () => 'warning',
    high: () => 'danger',
  })
}

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
  // "Continue anyway" waives the verdict for the payload it was given for, and
  // that payload only: a rebuilt transaction (new fee settings, a refresh at
  // sign time) is scanned afresh and shows its own warning.
  const [dismissedPayload, setDismissedPayload] = useState<KeysignPayload>()
  const isRiskDismissed =
    dismissedPayload !== undefined &&
    keysignPayloadQuery.data !== undefined &&
    equals(KeysignPayloadSchema, dismissedPayload, keysignPayloadQuery.data)
  const flaggedTx = isRiskDismissed ? null : (scanResult ?? null)

  // The badge's ring reports the verdict; no verdict yet (or none possible)
  // leaves it off.
  const badgeTone = getReviewBadgeTone(scanResult)

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
            onContinue={() => setDismissedPayload(keysignPayloadQuery.data)}
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
