import { recordMap } from '@lib/utils/record/recordMap'
import { RequiredFields } from '@lib/utils/types/RequiredFields'

import { Chain } from '../../Chain'
import { Coin } from '../Coin'

export const initializeChainTokens = (
  raw: Record<Chain, Omit<RequiredFields<Coin, 'logo'>, 'chain'>[]>
): Partial<Record<Chain, RequiredFields<Coin, 'logo'>[]>> =>
  recordMap(raw, (tokens, chain) => tokens.map(token => ({ ...token, chain })))
