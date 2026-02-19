import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'

export const thorchainLpChainCode: Partial<Record<Chain, string>> = {
  [Chain.Avalanche]: 'AVAX',
  [Chain.Base]: 'BASE',
  [Chain.BitcoinCash]: 'BCH',
  [Chain.BSC]: 'BSC',
  [Chain.Bitcoin]: 'BTC',
  [Chain.Dash]: 'DASH',
  [Chain.Dogecoin]: 'DOGE',
  [Chain.Ethereum]: 'ETH',
  [Chain.Cosmos]: 'GAIA',
  [Chain.Kujira]: 'KUJI',
  [Chain.Litecoin]: 'LTC',
  [Chain.THORChain]: 'THOR',
  [Chain.Tron]: 'TRON',
  [Chain.Ripple]: 'XRP',
  [Chain.Arbitrum]: 'ARB',
  [Chain.Zcash]: 'ZEC',
}

export const thorchainLpSupportedChains = Object.keys(
  thorchainLpChainCode
).filter(chain => chain !== Chain.THORChain) as Chain[]

type GetThorchainLpPoolInput = {
  chain: Chain
  ticker: string
  id?: string | null
}

export const getThorchainLpPool = ({
  chain,
  ticker,
  id,
}: GetThorchainLpPoolInput): string => {
  const chainCode = thorchainLpChainCode[chain]
  if (!chainCode) {
    throw new Error(`Chain ${chain} is not supported for THORChain LP`)
  }

  if (id) {
    return `${chainCode}.${ticker}-${id.toUpperCase()}`
  }

  return `${chainCode}.${ticker}`
}

export const getThorchainLpNativePool = (chain: Chain): string => {
  const coin = chainFeeCoin[chain]
  return getThorchainLpPool({ chain, ticker: coin.ticker })
}
