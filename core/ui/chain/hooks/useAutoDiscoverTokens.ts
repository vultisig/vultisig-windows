import { Chain } from '@core/chain/Chain'
import { AccountCoin } from '@core/chain/coin/AccountCoin'
import {
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

  const vaultSet = useMemo(() => {
    const s = new Set<string>()
    for (const vc of vaultCoins) s.add(coinKeyToString(vc))
    return s
  }, [vaultCoins])

  const discoveredCoins: Coin[] = useMemo(() => {
    if (!whitelisted) return []
    return whitelisted.map(w => {
      const k = coinKeyToString(w)
      return { ...w, ...(metaByKey.get(k) ?? {}) }
    })
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
      const k = coinKeyToString(selected)
      if (vaultSet.has(k)) return
      const toSave = discoveredAccountCoins.find(d => coinKeyToString(d) === k)
      if (!toSave) return
      await saveCoins({ vaultId, coins: [toSave] })
    },
    [discoveredAccountCoins, vaultSet, saveCoins, vaultId]
  )

  return {
    isPending,
    discoveredCoins,
    ensureSaved,
  }
}
