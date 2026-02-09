import { parseUnits } from 'viem'

export const toChainAmount = (amount: number, decimals: number) => {
  const str = amount.toString()
  const value = /[eE]/.test(str) ? amount.toFixed(decimals) : str
  return parseUnits(value, decimals)
}
