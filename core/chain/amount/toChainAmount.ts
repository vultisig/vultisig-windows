import { parseUnits } from 'viem'

export const toChainAmount = (amount: number, decimals: number) =>
  parseUnits(amount.toFixed(decimals), decimals)
