import { toChainAmount } from '@core/chain/amount/toChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { knownTokensIndex } from '@core/chain/coin/knownTokens/index'

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
