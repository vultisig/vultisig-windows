import { Chain } from '../../Chain'
import { Coin } from '../Coin'
import { IBC_TOKENS } from '../ibc'

export const getMissingIBCTokens = (
  existing: Coin[],
  ibcMeta: Pick<Coin, 'ticker' | 'id'>[],
  chain: Chain
): Coin[] => {
  const key = (t: { ticker: string; decimals: number }) =>
    `${t.ticker}:${t.decimals}`
  const seen = new Set(existing.map(key))

  return IBC_TOKENS.filter(t => !seen.has(key(t)))
    .map(t => {
      const meta = ibcMeta.find(i => i.ticker === t.ticker)
      return meta ? { ...t, chain, id: meta.id } : null
    })
    .filter(Boolean) as Coin[]
}
