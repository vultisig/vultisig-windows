import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { knownTokensIndex } from '@core/chain/coin/knownTokens/index'

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

export type ResolvedTokenInfo = {
  chain: Chain | null
  ticker: string
  logo: string | undefined
  decimals: number
  priceProviderId: string | undefined
  contractAddress: string | undefined
  isLocallyVerified: boolean
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

export function resolveDecimalsByChainAndToken(
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

  const value = fromChainAmount(BigInt(smallestUnit), decimals)
  if (value === 0) return '0'

  const str = value.toFixed(decimals)
  const [intPart, fracPart] = str.split('.')
  if (!fracPart) return intPart
  const trimmed = fracPart.replace(/0+$/, '')
  if (!trimmed) return intPart
  return intPart + '.' + trimmed
}

export function isNativeCoin(ticker: string): boolean {
  const upper = ticker.toUpperCase()
  return Object.values(chainFeeCoin).some(fc => fc.ticker === upper)
}

export function inferChainFromTicker(ticker: string): string {
  const upper = ticker.toUpperCase()

  for (const [chain, fc] of Object.entries(chainFeeCoin)) {
    if (fc.ticker === upper) return chain
  }

  const ethTokens = knownTokensIndex[Chain.Ethereum]
  if (ethTokens) {
    for (const token of Object.values(ethTokens)) {
      if (token.ticker.toUpperCase() === upper) return Chain.Ethereum
    }
  }

  for (const chain of Object.values(Chain)) {
    if (chain === Chain.Ethereum) continue
    const tokens = knownTokensIndex[chain]
    if (!tokens) continue
    for (const token of Object.values(tokens)) {
      if (token.ticker.toUpperCase() === upper) return chain
    }
  }

  return ''
}

export function getTokenContractAddress(ticker: string, chain: string): string {
  const tokens = knownTokensIndex[chain as Chain]
  if (!tokens) return ''
  const upper = ticker.toUpperCase()
  for (const [contractAddress, token] of Object.entries(tokens)) {
    if (token.ticker.toUpperCase() === upper) return contractAddress
  }
  return ''
}

export function parseCoinInput(coinStr: string): Record<string, string> | null {
  const trimmed = coinStr.trim()
  if (!trimmed) return null

  const parts = trimmed.split('-')
  const ticker = parts[0].toUpperCase()

  let chain = ''
  if (parts.length > 1) {
    chain = parts[1]
  } else {
    chain = inferChainFromTicker(ticker)
  }

  if (!chain) return null

  const result: Record<string, string> = { chain }

  if (!isNativeCoin(ticker)) {
    const contractAddr = getTokenContractAddress(ticker, chain)
    if (contractAddr) {
      result.id = contractAddr
    }
  }

  return result
}

export function convertToSmallestUnit(
  amount: string,
  decimals: number
): string {
  return toChainAmount(parseFloat(amount), decimals).toString()
}

export function looksLikeAddress(s: string): boolean {
  if (s.length < 20) return false
  if (s.startsWith('0x') || s.startsWith('0X')) return s.length >= 42
  if (s.startsWith('bc1') || s.startsWith('tb1')) return true
  if (s.startsWith('T') && s.length === 34) return true
  if (s.includes(' ')) return false
  return s.length >= 25
}

export function truncateAddress(address: string): string {
  if (address.length <= 12) return address
  return address.slice(0, 6) + '...' + address.slice(-4)
}

export const resolveSwapTokenInfo = (
  chainStr: string,
  symbol: string,
  fallbackDecimals?: number
): ResolvedTokenInfo => {
  const chain = getChainFromString(chainStr)

  if (!chain) {
    return {
      chain: null,
      ticker: symbol,
      logo: undefined,
      decimals: fallbackDecimals ?? 18,
      priceProviderId: undefined,
      contractAddress: undefined,
      isLocallyVerified: false,
    }
  }

  const nativeCoin = chainFeeCoin[chain]
  if (nativeCoin.ticker.toUpperCase() === symbol.toUpperCase()) {
    return {
      chain,
      ticker: nativeCoin.ticker,
      logo: nativeCoin.logo,
      decimals: nativeCoin.decimals,
      priceProviderId: nativeCoin.priceProviderId,
      contractAddress: undefined,
      isLocallyVerified: true,
    }
  }

  const tokens = knownTokensIndex[chain]
  if (tokens) {
    for (const [addr, token] of Object.entries(tokens)) {
      if (token.ticker.toUpperCase() === symbol.toUpperCase()) {
        return {
          chain,
          ticker: token.ticker,
          logo: token.logo,
          decimals: token.decimals,
          priceProviderId: token.priceProviderId,
          contractAddress: addr,
          isLocallyVerified: true,
        }
      }
    }
  }

  return {
    chain,
    ticker: symbol,
    logo: undefined,
    decimals: fallbackDecimals ?? 18,
    priceProviderId: undefined,
    contractAddress: undefined,
    isLocallyVerified: false,
  }
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
export type { AssetInfo }
