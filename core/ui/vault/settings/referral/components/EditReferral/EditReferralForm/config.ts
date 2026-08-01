import { Chain } from '@vultisig/core-chain/Chain'

const poolChainMap: Record<string, Chain> = {
  AVAX: Chain.Avalanche,
  BASE: Chain.Base,
  BCH: Chain.BitcoinCash,
  BTC: Chain.Bitcoin,
  DOGE: Chain.Dogecoin,
  ETH: Chain.Ethereum,
  GAIA: Chain.Cosmos,
  LTC: Chain.Litecoin,
  THOR: Chain.THORChain,
  XRP: Chain.Ripple,
}

export const normaliseChainToMatchPoolChain = (c: string) =>
  (poolChainMap[c.toUpperCase()] ?? c).toUpperCase()
