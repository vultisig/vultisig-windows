import { MaxUint256 } from 'ethers'

const maxUint160 = (1n << 160n) - 1n

const uint160AmountPrimaryTypes = new Set(['PermitSingle', 'PermitBatch'])

type IsUnlimitedPermitAmountInput = {
  amount: bigint
  primaryType: string
}

/**
 * Whether a permit amount is a max-value sentinel, i.e. an unlimited
 * approval. Every permit primary type lets the spender pull tokens, so
 * `2^256-1` always counts; `2^160-1` counts only for Permit2's
 * `PermitSingle` / `PermitBatch`, which store the amount as a uint160.
 * Needs no token metadata, so the warning can show before it loads.
 */
export const isUnlimitedPermitAmount = ({
  amount,
  primaryType,
}: IsUnlimitedPermitAmountInput): boolean =>
  amount === MaxUint256 ||
  (amount === maxUint160 && uint160AmountPrimaryTypes.has(primaryType))
