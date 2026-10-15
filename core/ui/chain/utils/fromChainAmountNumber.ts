import { fromChainAmountExact } from '@vultisig/core-chain/amount/fromChainAmountExact'

type FromChainAmountNumberInput = {
  amount: bigint
  decimals: number
}

/**
 * Converts a base-unit amount to a display number through exact bigint math, so
 * round amounts on high-decimal chains stay round: `fromChainAmount` divides
 * floats and turns 0.1 NEAR (10^23, not a double) into 0.09999999999999999.
 */
export const fromChainAmountNumber = ({
  amount,
  decimals,
}: FromChainAmountNumberInput): number =>
  Number(fromChainAmountExact(amount, decimals))
