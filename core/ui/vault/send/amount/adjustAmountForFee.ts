import { getMaxValue } from '@vultisig/core-chain/amount/getMaxValue'

type AdjustAmountForFeeInput = {
  amount: bigint
  balance: bigint
  fee: bigint
}

/**
 * Reduces an amount to `balance - fee` when the balance covers the amount on its
 * own but not together with the network fee. Only ever reduces, so a send never
 * grows past what was asked for.
 *
 * An amount that overshoots the balance by itself is returned untouched — that
 * is a real over-entry for the caller to reject, not a fee edge — and so is one
 * whose fee swallows the whole balance, since there is nothing left to adjust
 * to.
 */
export const adjustAmountForFee = ({
  amount,
  balance,
  fee,
}: AdjustAmountForFeeInput): bigint => {
  if (amount > balance || amount + fee <= balance) {
    return amount
  }

  const spendable = getMaxValue(balance, fee)

  return spendable > 0n ? spendable : amount
}
