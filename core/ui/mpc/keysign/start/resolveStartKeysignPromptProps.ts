import { Query } from '@lib/ui/query/Query'
import { SwapQuote } from '@vultisig/core-chain/swap/quote/SwapQuote'
import { BuildKeysignPayloadError } from '@vultisig/core-mpc/keysign/error'
import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'
import { match } from '@vultisig/lib-utils/match'
import { TFunction } from 'i18next'

import { StartKeysignPromptProps } from '../prompt/StartKeysignPromptProps'

type ResolveStartKeysignPromptPropsInput = {
  t: TFunction
  termsAccepted: boolean[]
  keysignPayloadQuery: Query<KeysignPayload>
  /** The Blockaid scan is in flight — see `useBlockaidTxScanQuery`. */
  isScanning: boolean
  extraPendingMessage?: string
  disabledMessage?: string
  toAddressLabel?: string
  swapQuote?: SwapQuote
}

/**
 * Decides whether the start-keysign button signs or stays disabled, and why.
 *
 * Order matters: the payload build is reported before the security scan, so a
 * transaction that is still being built never claims to be scanning. Both are
 * waits the user has to sit through, so both mark the button as loading — a
 * disabled button whose only explanation is a hover tooltip reads as broken.
 */
export const resolveStartKeysignPromptProps = ({
  t,
  termsAccepted,
  keysignPayloadQuery,
  isScanning,
  extraPendingMessage,
  disabledMessage,
  toAddressLabel,
  swapQuote,
}: ResolveStartKeysignPromptPropsInput): StartKeysignPromptProps => {
  if (termsAccepted.some(term => !term)) {
    return {
      disabledMessage: t('terms_required'),
    }
  }

  if (keysignPayloadQuery.isPending) {
    return {
      disabledMessage: t('loading'),
      isLoading: true,
    }
  }

  if (isScanning) {
    return {
      disabledMessage: t('scanning'),
      isLoading: true,
    }
  }

  if (extraPendingMessage) {
    return {
      disabledMessage: extraPendingMessage,
    }
  }

  if (keysignPayloadQuery.error) {
    if (keysignPayloadQuery.error instanceof BuildKeysignPayloadError) {
      return {
        disabledMessage: match(keysignPayloadQuery.error.type, {
          'not-enough-funds': () => t('not_enough_funds'),
          'ripple-destination-not-activated': () =>
            extractErrorMsg(keysignPayloadQuery.error),
          'ripple-destination-tag-invalid': () =>
            extractErrorMsg(keysignPayloadQuery.error),
          'ripple-destination-tag-required': () =>
            t('ripple_destination_tag_required'),
          'ripple-destination-trust-line-missing': () =>
            extractErrorMsg(keysignPayloadQuery.error),
          'ripple-issued-currency-amount-invalid': () =>
            extractErrorMsg(keysignPayloadQuery.error),
          'ripple-issuer-transfer-fee-unsupported': () =>
            extractErrorMsg(keysignPayloadQuery.error),
          'ripple-trust-line-issuer-not-activated': () =>
            extractErrorMsg(keysignPayloadQuery.error),
          'ton-memo-too-long': () => extractErrorMsg(keysignPayloadQuery.error),
        }),
      }
    }
    return {
      disabledMessage: extractErrorMsg(keysignPayloadQuery.error),
    }
  }

  const keysign = keysignPayloadQuery.data

  if (!keysign) {
    return {}
  }

  if (disabledMessage) {
    return { disabledMessage }
  }

  return {
    keysignPayload: { keysign },
    ...(toAddressLabel ? { toAddressLabel } : {}),
    ...(swapQuote ? { swapQuote } : {}),
  }
}
