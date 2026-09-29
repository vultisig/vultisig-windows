type RescaleChainAmountInput = {
  amount: bigint
  fromDecimals: number
  toDecimals: number
}

/**
 * Re-expresses a base-unit amount in a coin with different decimals while
 * keeping the same human-readable number. Digits the target coin cannot hold
 * are truncated.
 */
export const rescaleChainAmount = ({
  amount,
  fromDecimals,
  toDecimals,
}: RescaleChainAmountInput) => {
  if (toDecimals >= fromDecimals) {
    return amount * 10n ** BigInt(toDecimals - fromDecimals)
  }

  return amount / 10n ** BigInt(fromDecimals - toDecimals)
}
