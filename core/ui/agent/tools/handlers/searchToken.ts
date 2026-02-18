import { Chain, EvmChain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { SolanaJupiterToken } from '@core/chain/coin/jupiter/token'
import { knownTokensIndex } from '@core/chain/coin/knownTokens/index'
import { OneInchTokensResponse } from '@core/chain/coin/oneInch/token'
import { getCoinPrices } from '@core/chain/coin/price/getCoinPrices'
import { baseJupiterTokensUrl } from '@core/chain/coin/token/metadata/resolvers/solana'
import { fetchOneInchTokensRaw } from '@core/ui/chain/coin/queries/fetchWhitelistedCoins'
import { queryUrl } from '@lib/utils/query/queryUrl'

import { getChainFromString } from '../../utils/getChainFromString'
import type { ToolHandler } from '../types'

type TokenResult = {
  chain: string
  ticker: string
  contract_address: string
  decimals: number
  logo: string
  name: string
  price_provider_id: string
  source: string
}

type CacheEntry = {
  data: OneInchTokensResponse
  timestamp: number
}

const oneInchCache = new Map<string, CacheEntry>()
const cacheTtlMs = 5 * 60 * 1000

const matchType = (
  ticker: string,
  query: string
): 'exact' | 'prefix' | 'substring' | null => {
  const t = ticker.toLowerCase()
  const q = query.toLowerCase()
  if (t === q) return 'exact'
  if (t.startsWith(q)) return 'prefix'
  if (t.includes(q)) return 'substring'
  return null
}

const rankOrder: Record<string, number> = {
  exact: 0,
  prefix: 1,
  substring: 2,
}

const searchKnownTokens = (
  query: string,
  chainFilter: Chain | null
): TokenResult[] => {
  const results: TokenResult[] = []
  const chains = chainFilter ? [chainFilter] : Object.values(Chain)
  const queryLower = query.toLowerCase()
  const isAddress =
    queryLower.startsWith('0x') ||
    (queryLower.length > 30 && !queryLower.includes(' '))

  for (const chain of chains) {
    const fee = chainFeeCoin[chain]
    if (fee) {
      const mt = matchType(fee.ticker, query)
      if (mt) {
        results.push({
          chain,
          ticker: fee.ticker,
          contract_address: '',
          decimals: fee.decimals,
          logo: fee.logo,
          name: fee.ticker,
          price_provider_id: fee.priceProviderId ?? '',
          source: 'known',
        })
      }
    }

    const tokens = knownTokensIndex[chain]
    if (!tokens) continue

    for (const [address, token] of Object.entries(tokens)) {
      if (isAddress) {
        if (address.toLowerCase() === queryLower) {
          results.push({
            chain,
            ticker: token.ticker,
            contract_address: address,
            decimals: token.decimals,
            logo: token.logo,
            name: token.ticker,
            price_provider_id: token.priceProviderId ?? '',
            source: 'known',
          })
        }
        continue
      }

      const mt = matchType(token.ticker, query)
      if (mt) {
        results.push({
          chain,
          ticker: token.ticker,
          contract_address: address,
          decimals: token.decimals,
          logo: token.logo,
          name: token.ticker,
          price_provider_id: token.priceProviderId ?? '',
          source: 'known',
        })
      }
    }
  }

  return results
}

const fetchOneInchTokensCached = async (
  chain: EvmChain
): Promise<OneInchTokensResponse> => {
  const cached = oneInchCache.get(chain)
  if (cached && Date.now() - cached.timestamp < cacheTtlMs) {
    return cached.data
  }

  const data = await fetchOneInchTokensRaw(chain)
  oneInchCache.set(chain, { data, timestamp: Date.now() })
  return data
}

const searchOneInchChain = async (
  chain: EvmChain,
  query: string
): Promise<TokenResult[]> => {
  const data = await fetchOneInchTokensCached(chain)
  const results: TokenResult[] = []
  const queryLower = query.toLowerCase()
  const isAddress = queryLower.startsWith('0x')

  for (const token of Object.values(data.tokens)) {
    if (isAddress) {
      if (token.address.toLowerCase() === queryLower) {
        results.push({
          chain,
          ticker: token.symbol,
          contract_address: token.address,
          decimals: token.decimals,
          logo: token.logoURI ?? '',
          name: token.name,
          price_provider_id: '',
          source: '1inch',
        })
      }
      continue
    }

    const mt = matchType(token.symbol, query)
    if (!mt) {
      const nameLower = token.name.toLowerCase()
      if (!nameLower.includes(queryLower)) continue
    }

    results.push({
      chain,
      ticker: token.symbol,
      contract_address: token.address,
      decimals: token.decimals,
      logo: token.logoURI ?? '',
      name: token.name,
      price_provider_id: '',
      source: '1inch',
    })
  }

  return results
}

const searchJupiter = async (query: string): Promise<TokenResult[]> => {
  const url = `${baseJupiterTokensUrl}/search?query=${encodeURIComponent(query)}`
  const data = await queryUrl<SolanaJupiterToken[]>(url)
  return data.map(token => ({
    chain: Chain.Solana,
    ticker: token.symbol,
    contract_address: token.id,
    decimals: token.decimals,
    logo: token.icon ?? '',
    name: token.name,
    price_provider_id: '',
    source: 'jupiter',
  }))
}

const dedupeAndRank = (
  results: TokenResult[],
  query: string
): TokenResult[] => {
  const seen = new Map<string, TokenResult>()

  for (const r of results) {
    const key = `${r.chain}:${r.contract_address.toLowerCase()}`
    const existing = seen.get(key)
    if (!existing || r.source === 'known') {
      seen.set(key, r)
    }
  }

  const deduped = Array.from(seen.values())

  deduped.sort((a, b) => {
    const mtA = matchType(a.ticker, query) ?? 'substring'
    const mtB = matchType(b.ticker, query) ?? 'substring'
    const rankDiff = rankOrder[mtA] - rankOrder[mtB]
    if (rankDiff !== 0) return rankDiff

    if (a.source === 'known' && b.source !== 'known') return -1
    if (a.source !== 'known' && b.source === 'known') return 1

    return 0
  })

  return deduped.slice(0, 10)
}

export const handleSearchToken: ToolHandler = async input => {
  const query = String(input.query ?? '').trim()
  if (!query) throw new Error('query is required')

  const chainInput = input.chain ? String(input.chain).trim() : null
  let chainFilter: Chain | null = null
  if (chainInput) {
    chainFilter = getChainFromString(chainInput)
    if (!chainFilter) {
      throw new Error(`Unknown chain '${chainInput}'`)
    }
  }

  const knownResults = searchKnownTokens(query, chainFilter)

  const apiPromises: Promise<TokenResult[]>[] = []

  const evmChains = Object.values(EvmChain)
  if (chainFilter) {
    if (chainFilter === Chain.Solana) {
      apiPromises.push(searchJupiter(query).catch(() => []))
    } else if (evmChains.includes(chainFilter as EvmChain)) {
      apiPromises.push(
        searchOneInchChain(chainFilter as EvmChain, query).catch(() => [])
      )
    }
  } else {
    apiPromises.push(searchJupiter(query).catch(() => []))
    for (const evmChain of evmChains) {
      apiPromises.push(searchOneInchChain(evmChain, query).catch(() => []))
    }
  }

  const apiResults = await Promise.all(apiPromises)
  const allResults = [...knownResults, ...apiResults.flat()]

  const ranked = dedupeAndRank(allResults, query)

  if (ranked.length === 0) {
    return {
      data: {
        query,
        chain_filter: chainFilter,
        results: [],
        total_found: 0,
        message: `No tokens found matching '${query}'`,
      },
    }
  }

  const priceIds = ranked.map(r => r.price_provider_id).filter(Boolean)
  const uniquePriceIds = [...new Set(priceIds)]

  let priceMap: Record<string, number> = {}
  if (uniquePriceIds.length > 0) {
    try {
      priceMap = await getCoinPrices({ ids: uniquePriceIds })
    } catch {
      // prices are best-effort
    }
  }

  const results = ranked.map(({ source: _source, ...rest }) => ({
    chain: rest.chain,
    symbol: rest.ticker,
    name: rest.name,
    contract_address: rest.contract_address,
    decimals: rest.decimals,
    logo: rest.logo,
    price_usd: rest.price_provider_id
      ? (priceMap[rest.price_provider_id.toLowerCase()] ?? null)
      : null,
    price_provider_id: rest.price_provider_id,
  }))

  return {
    data: {
      query,
      chain_filter: chainFilter,
      results,
      total_found: allResults.length,
      message: `Found ${allResults.length} tokens matching '${query}', showing top ${results.length}. Present these to the user for review — do not auto-add.`,
    },
  }
}
