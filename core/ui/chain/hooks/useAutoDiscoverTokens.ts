import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import {
  areEqualCoins, // ✅ use equality helper
  Coin,
  CoinKey,
  coinKeyToString,
  coinMetadataFields,
} from '@core/chain/coin/Coin'
import { coins } from '@core/chain/coin/coins'
import { useWhitelistedCoinsQuery } from '@core/ui/chain/coin/queries/useWhitelistedCoinsQuery'
import { useCreateCoinsMutation } from '@core/ui/storage/coins'
import { useAssertCurrentVaultId } from '@core/ui/storage/currentVaultId'
import {
  useCurrentVaultAddresses,
  useCurrentVaultCoins,
} from '@core/ui/vault/state/currentVaultCoins'
import { pick } from '@lib/utils/record/pick'
import { useCallback, useMemo } from 'react'

type Props = { chain: Chain }

export const useAutoDiscoverTokens = ({ chain }: Props) => {
  const { data: whitelisted, isPending } = useWhitelistedCoinsQuery(chain)

  const vaultCoins = useCurrentVaultCoins()
  const addresses = useCurrentVaultAddresses()
  const accountAddress = addresses[chain]

  const { mutateAsync: saveCoins } = useCreateCoinsMutation()
  const vaultId = useAssertCurrentVaultId()

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
      if (seen.has(k)) continue
      seen.add(k)
      out.push({ ...w, ...(metaByKey.get(k) ?? {}) })
    }
    return out
  }, [whitelisted, metaByKey])

  const discoveredAccountCoins: AccountCoin[] = useMemo(() => {
    if (!accountAddress) return []
    const out: AccountCoin[] = []
    for (const c of discoveredCoins) {
      const k = coinKeyToString(c)
      if (vaultSet.has(k)) continue
      out.push({ ...c, address: accountAddress })
    }
    return out
  }, [discoveredCoins, vaultSet, accountAddress])

  const ensureSaved = useCallback(
    async (selected: CoinKey) => {
      const key = coinKeyToString(selected)
      if (vaultSet.has(key)) return

      const toSave = discoveredAccountCoins.find(d =>
        areEqualCoins(d, selected)
      )
      if (!toSave) return

      await saveCoins({ vaultId, coins: [toSave] })
    },
    [discoveredAccountCoins, vaultSet, saveCoins, vaultId]
  )

  return { isPending, discoveredCoins, ensureSaved }
}
