import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { knownTokensIndex } from '@core/chain/coin/knownTokens/index'
import { parseUnits } from 'viem'

import { getChainFromString } from '../../utils/getChainFromString'

type AssetInfo = {
  chain: string
  tokenAddress: string
  isNative: boolean
  ticker: string
  decimals: number
  logo: string
  priceProviderId: string
}

const ambiguousDefaults: Record<string, { chain: Chain; tokenId: string }> = {
  usdc: {
    chain: Chain.Ethereum,
    tokenId: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
  },
  usdt: {
    chain: Chain.Ethereum,
    tokenId: '0xdac17f958d2ee523a2206206994597c13d831ec7',
  },
  weth: {
    chain: Chain.Ethereum,
    tokenId: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  },
}

const chainPrefixAliases: Record<string, Chain> = {
  base: Chain.Base,
  arb: Chain.Arbitrum,
  op: Chain.Optimism,
}

function makeAssetInfoFromFeeCoin(chain: Chain): AssetInfo {
  const fc = chainFeeCoin[chain]
  return {
    chain,
    tokenAddress: '',
    isNative: true,
    ticker: fc.ticker,
    decimals: fc.decimals,
    logo: fc.logo,
    priceProviderId: fc.priceProviderId ?? '',
  }
}

function makeAssetInfoFromToken(
  chain: Chain,
  tokenAddress: string
): AssetInfo | null {
  const tokens = knownTokensIndex[chain]
  if (!tokens) return null
  const token = tokens[tokenAddress.toLowerCase()]
  if (!token) return null
  return {
    chain,
    tokenAddress: token.id ?? tokenAddress,
    isNative: false,
    ticker: token.ticker,
    decimals: token.decimals,
    logo: token.logo,
    priceProviderId: token.priceProviderId ?? '',
  }
}

function findTokenByTicker(chain: Chain, ticker: string): AssetInfo | null {
  const tokens = knownTokensIndex[chain]
  if (!tokens) return null
  const upper = ticker.toUpperCase()
  for (const [addr, token] of Object.entries(tokens)) {
    if (token.ticker.toUpperCase() === upper) {
      return {
        chain,
        tokenAddress: token.id ?? addr,
        isNative: false,
        ticker: token.ticker,
        decimals: token.decimals,
        logo: token.logo,
        priceProviderId: token.priceProviderId ?? '',
      }
    }
  }
  return null
}

export function resolveAsset(input: string): AssetInfo | null {
  const lower = input.toLowerCase().trim()
  if (!lower) return null

  const ambiguous = ambiguousDefaults[lower]
  if (ambiguous) {
    return makeAssetInfoFromToken(ambiguous.chain, ambiguous.tokenId)
  }

  if (lower.includes(':')) {
    const colonIdx = lower.indexOf(':')
    const tickerPart = lower.slice(0, colonIdx)
    const chainPart = lower.slice(colonIdx + 1)
    const chain = getChainFromString(chainPart)
    if (!chain) return null

    const fc = chainFeeCoin[chain]
    if (fc.ticker.toLowerCase() === tickerPart) {
      return makeAssetInfoFromFeeCoin(chain)
    }
    return findTokenByTicker(chain, tickerPart)
  }

  if (lower.includes('.')) {
    const dotIdx = lower.indexOf('.')
    const prefix = lower.slice(0, dotIdx)
    const tickerPart = lower.slice(dotIdx + 1)
    const chain = chainPrefixAliases[prefix]
    if (chain) {
      const fc = chainFeeCoin[chain]
      if (fc.ticker.toLowerCase() === tickerPart) {
        return makeAssetInfoFromFeeCoin(chain)
      }
      return findTokenByTicker(chain, tickerPart)
    }
  }

  if (lower === 'matic') {
    return makeAssetInfoFromFeeCoin(Chain.Polygon)
  }

  for (const chain of Object.values(Chain)) {
    const fc = chainFeeCoin[chain]
    if (fc.ticker.toLowerCase() === lower) {
      return makeAssetInfoFromFeeCoin(chain)
    }
  }

  for (const chain of Object.values(Chain)) {
    const result = findTokenByTicker(chain, lower)
    if (result) return result
  }

  return null
}

export function resolveTickerByChainAndToken(
  chain: string,
  tokenAddress: string
): string {
  const resolved = getChainFromString(chain)
  if (!resolved) return chain

  if (!tokenAddress) {
    return chainFeeCoin[resolved].ticker
  }

  const tokens = knownTokensIndex[resolved]
  if (tokens) {
    const token = tokens[tokenAddress.toLowerCase()]
    if (token) return token.ticker
  }

  if (tokenAddress.length > 10) {
    return tokenAddress.slice(0, 6) + '...' + tokenAddress.slice(-4)
  }
  return tokenAddress
}

function resolveDecimalsByChainAndToken(
  chain: string,
  tokenAddress: string
): number {
  const resolved = getChainFromString(chain)
  if (!resolved) return 18

  if (!tokenAddress) {
    return chainFeeCoin[resolved].decimals
  }

  const tokens = knownTokensIndex[resolved]
  if (tokens) {
    const token = tokens[tokenAddress.toLowerCase()]
    if (token) return token.decimals
  }

  return 18
}

export function formatHumanAmount(
  smallestUnit: string,
  chain: string,
  tokenAddress: string
): string {
  const decimals = resolveDecimalsByChainAndToken(chain, tokenAddress)
  if (decimals === 0) return smallestUnit

  const sanitized = smallestUnit.trim()
  if (!sanitized || !/^-?\d+$/.test(sanitized)) return smallestUnit

  const value = fromChainAmount(BigInt(sanitized), decimals)
  if (value === 0) return '0'

  const str = value.toFixed(decimals)
  const [intPart, fracPart] = str.split('.')
  if (!fracPart) return intPart
  const trimmed = fracPart.replace(/0+$/, '')
  if (!trimmed) return intPart
  return intPart + '.' + trimmed
}

export function convertToSmallestUnit(
  amount: string,
  decimals: number
): string {
  return parseUnits(amount, decimals).toString()
}

const assetAliases: Record<string, AssetInfo> = (() => {
  const result: Record<string, AssetInfo> = {}

  for (const chain of Object.values(Chain)) {
    const fc = chainFeeCoin[chain]
    const lower = fc.ticker.toLowerCase()
    if (!result[lower]) {
      result[lower] = makeAssetInfoFromFeeCoin(chain)
    }
  }

  for (const chain of Object.values(Chain)) {
    const tokens = knownTokensIndex[chain]
    if (!tokens) continue
    for (const [addr, token] of Object.entries(tokens)) {
      const lower = token.ticker.toLowerCase()
      if (!result[lower]) {
        result[lower] = {
          chain,
          tokenAddress: token.id ?? addr,
          isNative: false,
          ticker: token.ticker,
          decimals: token.decimals,
          logo: token.logo,
          priceProviderId: token.priceProviderId ?? '',
        }
      }
      const qualified = `${lower}:${chain.toLowerCase()}`
      result[qualified] = {
        chain,
        tokenAddress: token.id ?? addr,
        isNative: false,
        ticker: token.ticker,
        decimals: token.decimals,
        logo: token.logo,
        priceProviderId: token.priceProviderId ?? '',
      }
    }
  }

  result['matic'] = makeAssetInfoFromFeeCoin(Chain.Polygon)
  result['base.eth'] = makeAssetInfoFromFeeCoin(Chain.Base)
  result['arb.eth'] = makeAssetInfoFromFeeCoin(Chain.Arbitrum)
  result['op.eth'] = makeAssetInfoFromFeeCoin(Chain.Optimism)

  return result
})()

export { assetAliases }
