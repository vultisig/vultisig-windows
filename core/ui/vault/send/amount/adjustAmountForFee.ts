type AdjustAmountForFeeInput = {
  amount: bigint
  balance: bigint
  /**
   * The most the balance can spend once the fee, and whatever the chain
   * requires the sender to keep, are reserved out of it.
   */
  maxSendable: bigint
}

/**
 * Reduces an amount to the most the balance can spend when the balance covers
 * the amount on its own but not together with the fee and what the chain
 * keeps back. Only ever reduces, so a send never grows past what was asked for.
 *
 * An amount that overshoots the balance by itself is returned untouched — that
 * is a real over-entry for the caller to reject, not a fee edge — and so is one
 * whose fee swallows the whole balance, since there is nothing left to adjust
 * to.
 */
export const adjustAmountForFee = ({
  amount,
  balance,
  maxSendable,
}: AdjustAmountForFeeInput): bigint => {
  if (amount > balance) {
    return amount
  }

  if (amount <= maxSendable) {
    return amount
  }

  return maxSendable > 0n ? maxSendable : amount
}
