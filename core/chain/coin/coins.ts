import { chainFeeCoin } from './chainFeeCoin'
import { chainTokens } from './chainTokens'

export const coins = [
  ...Object.values(chainFeeCoin),
  ...Object.values(chainTokens).flat(),
]
