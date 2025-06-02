import { chainFeeCoin } from './chainFeeCoin'
import { chainNativeTokens, chainTokens } from './chainTokens'

export const coins = [
  ...Object.values(chainFeeCoin),
  ...Object.values(chainTokens).flat(),
  ...Object.values(chainNativeTokens).flat(),
]
