import { toChainAmount } from '@vultisig/core-chain/amount/toChainAmount'

type ParseAgentChainAmountInput = {
  amount: string
  decimals: number
  allowZero?: boolean
}

export const parseAgentChainAmount = ({
  amount,
  decimals,
  allowZero = false,
}: ParseAgentChainAmountInput): bigint => {
  if (amount.trim().startsWith('-')) {
    throw new Error(`Invalid amount: ${amount}`)
  }

  let chainAmount: bigint
  try {
    chainAmount = toChainAmount(amount, decimals)
  } catch {
    throw new Error(`Invalid amount: ${amount}`)
  }

  if (allowZero ? chainAmount < 0n : chainAmount <= 0n) {
    throw new Error(`Invalid amount: ${amount}`)
  }

  return chainAmount
}
