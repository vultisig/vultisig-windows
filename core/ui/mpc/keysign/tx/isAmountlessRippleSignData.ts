import { KeysignPayload } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import { attempt, withFallback } from '@vultisig/lib-utils/attempt'

/**
 * Whether a dApp-supplied XRPL transaction leaves the done screen without a
 * single send amount to headline.
 *
 * A `Payment` binds its drops to the payload's `toAmount`, so the hero can show
 * the figure the signer agreed to. An offer is two-sided and a trust line has
 * no send scalar at all: both reach the payload as zero, and `SignRippleDisplay`
 * reports their real figures in the details below. A scalar that does not parse
 * is treated as absent rather than headlined. Non-XRPL payloads are never
 * amountless here.
 */
export const isAmountlessRippleSignData = (value: KeysignPayload) =>
  value.signData.case === 'signRipple' &&
  withFallback(
    attempt(() => BigInt(value.toAmount)),
    0n
  ) === 0n
