import { TokenApproval } from './TokenApproval'

// Each standard's max value (uint256, uint160, u64), which dApps use to mean "unlimited".
const maxAllowance: Record<TokenApproval['kind'], bigint> = {
  erc20: 2n ** 256n - 1n,
  permit2: 2n ** 160n - 1n,
  splDelegate: 2n ** 64n - 1n,
}

/**
 * Whether the approval lets its spender move any amount of the token. Tokens
 * like USDC spend down even a max approval, so anything in the top half of the
 * range counts. That exceeds any EVM token's supply; on u64 SPL mints it can
 * sit near one (BONK's is 95% of it), where "Unlimited" is still the safe read.
 */
export const isUnlimitedAllowance = ({ kind, allowance }: TokenApproval) =>
  allowance >= maxAllowance[kind] / 2n
