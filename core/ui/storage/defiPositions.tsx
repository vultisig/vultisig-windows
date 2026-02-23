import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { Coin } from '@core/chain/coin/Coin'
import { knownTokens, knownTokensIndex } from '@core/chain/coin/knownTokens'
import { findByTicker } from '@core/chain/coin/utils/findByTicker'
import {
  mayaMidgardBaseUrl,
  midgardBaseUrl,
} from '@core/ui/defi/chain/queries/constants'
import { mayaCoin, runeCoin } from '@core/ui/defi/chain/queries/tokens'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { queryUrl } from '@lib/utils/query/queryUrl'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useMemo } from 'react'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

type DefiPositionType = 'bond' | 'stake' | 'lp'

export type DefiPosition = {
  id: string
  name: string
  ticker: string
  type: DefiPositionType
  chain: Chain
  coin?: Coin
  poolAsset?: string
  legacyIds?: string[]
  apr?: number
}

type LpSupportedChain = typeof Chain.THORChain | typeof Chain.MayaChain

const staticDefiPositions: Partial<Record<Chain, DefiPosition[]>> = {
  [Chain.THORChain]: [
    {
      id: 'thor-bond-rune',
      name: 'RUNE',
      ticker: 'RUNE',
      type: 'bond',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-stake-tcy',
      name: 'TCY',
      ticker: 'TCY',
      type: 'stake',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-stake-ruji',
      name: 'RUJI',
      ticker: 'RUJI',
      type: 'stake',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-stake-yrune',
      name: 'yRUNE',
      ticker: 'yRUNE',
      type: 'stake',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-stake-ytcy',
      name: 'yTCY',
      ticker: 'yTCY',
      type: 'stake',
      chain: Chain.THORChain,
    },
    {
      id: 'thor-stake-stcy',
      name: 'sTCY',
      ticker: 'sTCY',
      type: 'stake',
      chain: Chain.THORChain,
    },
  ],
  [Chain.MayaChain]: [
    {
      id: 'maya-bond-cacao',
      name: 'CACAO',
      ticker: 'CACAO',
      type: 'bond',
      chain: Chain.MayaChain,
    },
    {
      id: 'maya-stake-cacao',
      name: 'CACAO',
      ticker: 'CACAO',
      type: 'stake',
      chain: Chain.MayaChain,
    },
  ],
}

const getAvailablePositionsForChain = (chain: Chain): DefiPosition[] => {
  return staticDefiPositions[chain] || []
}

const lpBaseTicker: Record<LpSupportedChain, string> = {
  [Chain.THORChain]: runeCoin.ticker,
  [Chain.MayaChain]: mayaCoin.ticker,
}

export const lpChainMap: Partial<Record<string, Chain>> = {
  AVAX: Chain.Avalanche,
  BASE: Chain.Base,
  BCH: Chain.BitcoinCash,
  BSC: Chain.BSC,
  BTC: Chain.Bitcoin,
  DASH: Chain.Dash,
  DOGE: Chain.Dogecoin,
  ETH: Chain.Ethereum,
  GAIA: Chain.Cosmos,
  KUJI: Chain.Kujira,
  LTC: Chain.Litecoin,
  THOR: Chain.THORChain,
  TRON: Chain.Tron,
  XRP: Chain.Ripple,
  ARB: Chain.Arbitrum,
  ZEC: Chain.Zcash,
}

const legacyThorLpIdsByAsset: Record<string, string> = {
  'ETH.ETH': 'thor-lp-rune-eth',
  'BTC.BTC': 'thor-lp-rune-btc',
  'BSC.BNB': 'thor-lp-rune-bnb',
  'ETH.USDC-0XA0B86991C6218B36C1D19D4A2E9EB0CE3606EB48': 'thor-lp-rune-usdc',
}

type BuildLpPositionIdInput = {
  chain: Chain
  poolAsset: string
}

const buildLpPositionId = ({ chain, poolAsset }: BuildLpPositionIdInput) => {
  const normalizedAsset = poolAsset.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()
  return `${chain.toLowerCase()}-lp-${normalizedAsset}`
}

type ParsedPoolAsset = {
  chain: Chain
  ticker: string
  tokenId?: string
  poolAsset: string
}

const parsePoolAsset = (poolAsset: string): ParsedPoolAsset | undefined => {
  const [chainCode, assetPart] = poolAsset.split('.')
  if (!chainCode || !assetPart) return undefined

  const chain = lpChainMap[chainCode.toUpperCase()]
  if (!chain) return undefined

  const [rawTicker, tokenId] = assetPart.split('-')
  if (!rawTicker) return undefined

  return {
    chain,
    ticker: rawTicker.toUpperCase(),
    tokenId: tokenId?.toLowerCase(),
    poolAsset,
  }
}

const buildCoinFromPoolAsset = ({
  chain,
  ticker,
  tokenId,
}: ParsedPoolAsset): Coin => {
  const knownTokenById =
    tokenId !== undefined ? knownTokensIndex[chain]?.[tokenId] : undefined
  const knownTokenByTicker = findByTicker({
    coins: knownTokens[chain] ?? [],
    ticker,
  })

  const fallbackCoin = chainFeeCoin[chain]
  const source = knownTokenById ?? knownTokenByTicker
  const logo = source?.logo ?? fallbackCoin?.logo ?? ticker.toLowerCase()

  return {
    chain,
    id: source?.id ?? tokenId,
    ticker,
    logo,
    decimals: source?.decimals ?? fallbackCoin?.decimals ?? 8,
    priceProviderId: source?.priceProviderId ?? fallbackCoin?.priceProviderId,
  }
}

type GetLegacyIdsForPoolInput = {
  chain: Chain
  poolAsset: string
}

const getLegacyIdsForPool = ({
  chain,
  poolAsset,
}: GetLegacyIdsForPoolInput): string[] => {
  if (chain !== Chain.THORChain) return []

  const legacyId = legacyThorLpIdsByAsset[poolAsset.toUpperCase()]
  return legacyId ? [legacyId] : []
}

type MidgardPool = {
  asset: string
  poolAPY?: string
  annualPercentageRate?: string
}

const fetchThorchainPools = () =>
  queryUrl<MidgardPool[]>(`${midgardBaseUrl}/pools?status=available`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

const fetchMayachainPools = () =>
  queryUrl<MidgardPool[]>(`${mayaMidgardBaseUrl}/pools?status=available`, {
    headers: { 'X-Client-ID': 'vultisig' },
  })

const lpPoolResolvers: Record<LpSupportedChain, () => Promise<MidgardPool[]>> =
  {
    [Chain.THORChain]: fetchThorchainPools,
    [Chain.MayaChain]: fetchMayachainPools,
  }

const fetchLpPools = (chain: LpSupportedChain) => lpPoolResolvers[chain]()

type MapLpPoolsToPositionsInput = {
  chain: LpSupportedChain
  pools: MidgardPool[]
}

const mapLpPoolsToPositions = ({
  chain,
  pools,
}: MapLpPoolsToPositionsInput): DefiPosition[] => {
  const baseTicker = lpBaseTicker[chain]

  return pools
    .map(pool => parsePoolAsset(pool.asset))
    .filter((parsed): parsed is ParsedPoolAsset => Boolean(parsed))
    .map(parsed => {
      const coin = buildCoinFromPoolAsset(parsed)
      const legacyIds = getLegacyIdsForPool({
        chain,
        poolAsset: parsed.poolAsset,
      })
      const pool = pools.find(({ asset }) => asset === parsed.poolAsset)
      const aprValue = pool?.poolAPY ?? pool?.annualPercentageRate
      const aprNumber =
        aprValue !== undefined ? Number.parseFloat(aprValue) * 100 : undefined
      const apr = Number.isFinite(aprNumber) ? aprNumber : undefined

      return {
        id: buildLpPositionId({ chain, poolAsset: parsed.poolAsset }),
        name: `${baseTicker}/${parsed.ticker}`,
        ticker: parsed.ticker,
        type: 'lp' as const,
        chain,
        coin,
        poolAsset: parsed.poolAsset,
        legacyIds,
        apr,
      }
    })
    .sort((left, right) => {
      const nameCompare = left.name.localeCompare(right.name)
      if (nameCompare !== 0) return nameCompare

      return (left.poolAsset ?? '').localeCompare(right.poolAsset ?? '')
    })
}

const useDefiLpPoolsQuery = (chain: Chain) => {
  const isSupported = chain === Chain.THORChain || chain === Chain.MayaChain

  return useQuery({
    queryKey: ['defi', chain, 'lp', 'pools'],
    enabled: isSupported,
    queryFn: () => fetchLpPools(chain as LpSupportedChain),
  })
}

export const useAvailableDefiPositions = (chain: Chain) => {
  const staticPositions = useMemo(
    () => getAvailablePositionsForChain(chain),
    [chain]
  )

  const lpPoolsQuery = useDefiLpPoolsQuery(chain)
  const isLpChain = chain === Chain.THORChain || chain === Chain.MayaChain

  const lpPositions = useMemo(
    () =>
      isLpChain
        ? mapLpPoolsToPositions({
            chain: chain as LpSupportedChain,
            pools: lpPoolsQuery.data ?? [],
          })
        : [],
    [chain, isLpChain, lpPoolsQuery.data]
  )

  const positions = useMemo(
    () => [...staticPositions, ...lpPositions],
    [lpPositions, staticPositions]
  )

  return {
    positions,
    isLoading: isLpChain ? lpPoolsQuery.isPending : false,
    error: isLpChain ? (lpPoolsQuery.error ?? null) : null,
  }
}

type IsDefiPositionSelectedInput = {
  position: DefiPosition
  selectedPositionIds: string[]
}

export const isDefiPositionSelected = ({
  position,
  selectedPositionIds,
}: IsDefiPositionSelectedInput) =>
  selectedPositionIds.includes(position.id) ||
  position.legacyIds?.some(id => selectedPositionIds.includes(id)) === true

type DefiPositionsRecord = Record<string, string[]> // chain -> position ids

type GetDefiPositionsFunction = () => Promise<DefiPositionsRecord>
type SetDefiPositionsFunction = (
  positions: DefiPositionsRecord
) => Promise<void>

export type DefiPositionsStorage = {
  getDefiPositions: GetDefiPositionsFunction
  setDefiPositions: SetDefiPositionsFunction
}

const useDefiPositionsQuery = () => {
  const { getDefiPositions } = useCore()

  return useQuery({
    queryKey: [StorageKey.defiPositions],
    queryFn: getDefiPositions,
    ...noRefetchQueryOptions,
  })
}

export const useDefiPositions = (chain: Chain): string[] => {
  const { data } = useDefiPositionsQuery()

  return data?.[chain] ?? []
}

const useAllDefiPositions = (): DefiPositionsRecord => {
  const { data } = useDefiPositionsQuery()

  return data ?? {}
}

const useSetDefiPositionsMutation = () => {
  const { setDefiPositions } = useCore()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: setDefiPositions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [StorageKey.defiPositions] })
    },
  })
}

export const useToggleDefiPosition = (chain: Chain) => {
  const allPositions = useAllDefiPositions()
  const chainPositions = allPositions[chain] ?? []
  const { mutate: setDefiPositions, isPending } = useSetDefiPositionsMutation()

  const togglePosition = (position: DefiPosition) => {
    const isSelected = isDefiPositionSelected({
      position,
      selectedPositionIds: chainPositions,
    })

    const legacyIds = position.legacyIds ?? []
    const filteredPositions = chainPositions.filter(
      id => id !== position.id && !legacyIds.includes(id)
    )

    const newChainPositions = isSelected
      ? filteredPositions
      : [...filteredPositions, position.id]

    setDefiPositions({
      ...allPositions,
      [chain]: newChainPositions,
    })
  }

  return { togglePosition, isPending }
}
