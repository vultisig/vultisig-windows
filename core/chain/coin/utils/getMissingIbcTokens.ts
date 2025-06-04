import { withoutUndefined } from '@lib/utils/array/withoutUndefined'
import { RequiredFields } from '@lib/utils/types/RequiredFields'

import { Chain } from '../../Chain'
import { Coin } from '../Coin'
import { ibcTokens } from '../ibc'

export const getMissingIBCTokens = (
  existing: RequiredFields<Coin, 'logo'>[],
  ibcMeta: Pick<RequiredFields<Coin, 'logo'>, 'ticker' | 'id'>[],
  chain: Chain
): RequiredFields<Coin, 'logo'>[] => {
  const key = (t: { ticker: string; decimals: number }) =>
    `${t.ticker}:${t.decimals}`
  const seen = new Set(existing.map(key))

  return withoutUndefined(
    ibcTokens
      .filter(t => !seen.has(key(t)))
      .map(t => {
        const meta = ibcMeta.find(i => i.ticker === t.ticker)
        return meta ? { ...t, chain, id: meta.id } : undefined
      })
  )
}
