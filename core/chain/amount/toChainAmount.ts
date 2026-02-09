import { parseUnits } from 'viem'

export const toChainAmount = (amount: number, decimals: number) =>
  parseUnits(amount.toString(), decimals)
