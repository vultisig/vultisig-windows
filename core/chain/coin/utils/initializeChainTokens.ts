import { recordMap } from '@lib/utils/record/recordMap'

import { Chain } from '../../Chain'
import { Coin } from '../Coin'

export const initializeChainTokens = (
  raw: Record<Chain, Omit<Coin, 'chain'>[]>
): Partial<Record<Chain, Coin[]>> =>
  recordMap(raw, (tokens, chain) => tokens.map(token => ({ ...token, chain })))
