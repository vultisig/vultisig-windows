import { chainFeeCoin } from './chainFeeCoin'
import { knownTokens } from './knownTokens'

export const coins = [
  ...Object.values(chainFeeCoin),
  ...Object.values(knownTokens).flat(),
]
