/**
 * `tfPartialPayment` on an XRPL `Payment`. With it set, `Amount` stops being a
 * guaranteed delivery and becomes a ceiling: the ledger delivers whatever the
 * chosen path can source and records the real figure only in the executed
 * transaction's metadata (`delivered_amount`). Absent a `DeliverMin` floor,
 * such a payment can settle for dust while still spending up to `SendMax`.
 */
const tfPartialPayment = 0x00020000

const maxUint32 = 0xffffffff

/**
 * Decodes an XRPL `Flags` field into its uint32 bitmask, reading an absent
 * field as "no flags set".
 *
 * Returns `null` for any present value the XRPL binary codec could not encode
 * as a uint32 — notably the `{ tfPartialPayment: true }` object sugar some
 * client libraries accept — so callers fail closed instead of mistaking an
 * undecodable value for zero.
 */
export const parseRippleTxFlags = (value: unknown): number | null => {
  if (value === undefined) return 0

  if (
    typeof value !== 'number' ||
    !Number.isInteger(value) ||
    value < 0 ||
    value > maxUint32
  ) {
    return null
  }

  return value
}

/** Whether a decoded `Flags` bitmask carries `tfPartialPayment`. */
export const hasPartialPaymentFlag = (flags: number): boolean =>
  (flags & tfPartialPayment) !== 0
