import { Chain } from '@core/chain/Chain'

export const getChainFromString = (chainStr: string): Chain | null => {
  const found = Object.values(Chain).find(
    c => c.toLowerCase() === chainStr.toLowerCase()
  )
  return found ?? null
}
