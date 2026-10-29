const maxUint256 = 2n ** 256n - 1n

/**
 * Whether an ERC-20 allowance is the max-uint256 sentinel that wallets and
 * dApps use for an unlimited approval.
 */
export const isUnlimitedAllowance = (allowance: bigint) =>
  allowance === maxUint256
