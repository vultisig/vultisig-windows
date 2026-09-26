import { getMaxSendableAmount } from '@vultisig/core-chain/amount/getMaxSendableAmount'
import { Chain } from '@vultisig/core-chain/Chain'

type AdjustAmountForFeeInput = {
  chain: Chain
  amount: bigint
  balance: bigint
  fee: bigint
  /**
   * The send empties the account, so nothing is kept back for the existential
   * deposit.
   */
  allowDeath?: boolean
}

/**
 * Reduces an amount to the most the balance can spend — `balance - fee`, less
 * whatever the chain requires the sender to keep so the account is not reaped
 * — when the balance covers the amount on its own but not together with those.
 * Only ever reduces, so a send never grows past what was asked for.
 *
 * An amount that overshoots the balance by itself is returned untouched — that
 * is a real over-entry for the caller to reject, not a fee edge — and so is one
 * whose fee swallows the whole balance, since there is nothing left to adjust
 * to.
 */
export const adjustAmountForFee = ({
  chain,
  amount,
  balance,
  fee,
  allowDeath,
}: AdjustAmountForFeeInput): bigint => {
  if (amount > balance) {
    return amount
  }

  const spendable = getMaxSendableAmount({ chain, balance, fee, allowDeath })

  if (amount <= spendable) {
    return amount
  }

  return spendable > 0n ? spendable : amount
}
