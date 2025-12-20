import { Chain } from '@core/chain/Chain'
import {
  Coin,
  coinKeyToString,
  coinMetadataFields,
} from '@core/chain/coin/Coin'
import { coins } from '@core/chain/coin/coins'
import { useWhitelistedCoinsQuery } from '@core/ui/chain/coin/queries/useWhitelistedCoinsQuery'
import { useCurrentVaultCoins } from '@core/ui/vault/state/currentVaultCoins'
import { pick } from '@lib/utils/record/pick'
import { useMemo } from 'react'

type Props = { chain: Chain }

export const useAutoDiscoverTokens = ({ chain }: Props) => {
  const { data: whitelisted, isPending } = useWhitelistedCoinsQuery(chain)

  const vaultCoins = useCurrentVaultCoins()

  const metaByKey = useMemo(() => {
    const m = new Map<string, Partial<Coin>>()
    for (const k of coins)
      m.set(coinKeyToString(k), pick(k, coinMetadataFields))
    return m
  }, [])

  // Set of existing vault coin keys to prevent saving duplicates
  const vaultSet = useMemo(() => {
    const s = new Set<string>()
    for (const vc of vaultCoins) s.add(coinKeyToString(vc))
    return s
  }, [vaultCoins])

  const discoveredCoins: Coin[] = useMemo(() => {
    if (!whitelisted) return []
    const seen = new Set<string>()
    const out: Coin[] = []
    for (const w of whitelisted) {
      const k = coinKeyToString(w)
      if (seen.has(k) || vaultSet.has(k)) continue
      seen.add(k)
      out.push({ ...w, ...(metaByKey.get(k) ?? {}) })
    }
    return out
  }, [whitelisted, vaultSet, metaByKey])

  return { isPending, discoveredCoins }
}
