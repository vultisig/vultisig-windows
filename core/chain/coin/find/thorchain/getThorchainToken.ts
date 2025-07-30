import { Chain } from '../../../Chain'
import { Coin } from '../../Coin'

const thorchainTokens: Record<string, Coin> = {
  'x/staking-x/ruji': {
    ticker: 'sRUJI',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'thor.nami': {
    ticker: 'NAMI',
    logo: 'nami.png',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'thor.lqdy': {
    ticker: 'LQDY',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'thor.auto': {
    ticker: 'AUTO',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/nami-index-fixed-thor1yqf5spdv8c4088zmvqsg32eq63fzepsjvntahdk0ek0yjnkt3qdqftp3lc-rcpt':
    {
      ticker: 'RJI',
      logo: 'nami.png',
      decimals: 8,
      chain: Chain.THORChain,
    },
  'x/staking-thor.nami': {
    ticker: 'sNAMI',
    logo: 'nami.png',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-gaia-atom-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'ATOM/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-avax-avax-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'AVAX/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-btc-btc-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'BTC/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-bch-bch-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'BCH/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-bnb-bnb-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'BNB/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-doge-doge-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'DOGE/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-eth-eth-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'ETH/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-ltc-ltc-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'LTC/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-xrp-xrp-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'XRP/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-thor.lqdy-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'LQDY/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-thor.auto-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'AUTO/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-thor.nami-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'NAMI/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-x/ruji-eth-usdc-0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': {
    ticker: 'RUJI/USDC.ETH',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-eth-eth-btc-btc': {
    ticker: 'ETH.ETH/BTC.BTC',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'x/bow-xyk-thor.lqdy-btc-btc': {
    ticker: 'LQDY/BTC.BTC',
    logo: 'ruji',
    decimals: 8,
    chain: Chain.THORChain,
  },
  'bch-bch': {
    ticker: 'BCH',
    logo: 'bch',
    decimals: 8,
    priceProviderId: 'bitcoin-cash',
    chain: Chain.THORChain,
  },
  'avax-avax': {
    ticker: 'AVAX',
    logo: 'avax',
    decimals: 8,
    priceProviderId: 'avalanche-2',
    chain: Chain.THORChain,
  },
}

export const getThorchainToken = async (
  tricker: string
): Promise<Coin | null> => {
  const token = thorchainTokens[tricker]

  if (!token) {
    return null
  }

  return {
    decimals: token.decimals,
    logo: token.logo,
    ticker: token.ticker,
    chain: token.chain,
  }
}
