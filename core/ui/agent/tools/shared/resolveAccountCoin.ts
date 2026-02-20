import type { Chain } from '@core/chain/Chain'
import type { AccountCoin } from '@core/chain/coin/AccountCoin'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

import { getChainFromString } from '../../utils/getChainFromString'
import type { CoinInfo } from '../types'

export function resolveAccountCoin(
  coins: CoinInfo[],
  chainStr: string,
  symbol: string
): AccountCoin | null {
  const chain = getChainFromString(chainStr)
  if (!chain) return null

  return resolveAccountCoinForChain(coins, chain, chainStr, symbol)
}

export function resolveAccountCoinForChain(
  coins: CoinInfo[],
  chain: Chain,
  chainStr: string,
  symbol: string
): AccountCoin | null {
  const upperSymbol = symbol.toUpperCase()

  const feeCoin = chainFeeCoin[chain]
  if (feeCoin.ticker.toUpperCase() === upperSymbol) {
    const vaultCoin = coins.find(
      c => c.chain.toLowerCase() === chainStr.toLowerCase() && c.isNativeToken
    )
    if (!vaultCoin) return null
    return {
      chain,
      address: vaultCoin.address,
      decimals: feeCoin.decimals,
      ticker: feeCoin.ticker,
      logo: feeCoin.logo,
      priceProviderId: feeCoin.priceProviderId,
    }
  }

  const vaultCoin = coins.find(
    c =>
      c.chain.toLowerCase() === chainStr.toLowerCase() &&
      c.ticker.toUpperCase() === upperSymbol
  )
  if (!vaultCoin) return null

  const nativeCoin = coins.find(
    c => c.chain.toLowerCase() === chainStr.toLowerCase() && c.isNativeToken
  )

  return {
    chain,
    id: vaultCoin.contractAddress || undefined,
    address: nativeCoin?.address ?? vaultCoin.address,
    decimals: vaultCoin.decimals,
    ticker: vaultCoin.ticker,
    logo: vaultCoin.logo,
    priceProviderId: vaultCoin.priceProviderId,
  }
}
