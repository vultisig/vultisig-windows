import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { knownTokensIndex } from '@core/chain/coin/knownTokens/index'

import { getChainFromString } from '../../utils/getChainFromString'

export type ResolvedTokenInfo = {
  chain: Chain | null
  ticker: string
  logo: string | undefined
  decimals: number
  priceProviderId: string | undefined
  contractAddress: string | undefined
  isLocallyVerified: boolean
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
