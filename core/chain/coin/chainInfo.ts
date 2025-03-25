import { recordMap } from '@lib/utils/record/recordMap'

import { Chain } from '../Chain'
import { Coin } from './Coin'

const leanChainInfos: Record<Chain, Pick<Coin, 'ticker' | 'logo'>> = {
  [Chain.Bitcoin]: { ticker: 'BTC', logo: 'btc' },
  [Chain.BitcoinCash]: { ticker: 'BCH', logo: 'bch' },
  [Chain.Litecoin]: { ticker: 'LTC', logo: 'ltc' },
  [Chain.Dogecoin]: { ticker: 'DOGE', logo: 'doge' },
  [Chain.Dash]: { ticker: 'DASH', logo: 'dash' },
  [Chain.Ripple]: { ticker: 'XRP', logo: 'xrp' },
  [Chain.THORChain]: { ticker: 'RUNE', logo: 'rune' },
  [Chain.MayaChain]: { ticker: 'CACAO', logo: 'cacao' },
  [Chain.Solana]: { ticker: 'SOL', logo: 'solana' },
  [Chain.Ton]: { ticker: 'TON', logo: 'ton' },
  [Chain.Ethereum]: { ticker: 'ETH', logo: 'ethereum' },
  [Chain.Avalanche]: { ticker: 'AVAX', logo: 'avax' },
  [Chain.BSC]: { ticker: 'BNB', logo: 'bsc' },
  [Chain.Base]: { ticker: 'BASE', logo: 'base' },
  [Chain.Arbitrum]: { ticker: 'ARB', logo: 'arbitrum' },
  [Chain.Optimism]: { ticker: 'OP', logo: 'optimism' },
  [Chain.Polygon]: { ticker: 'MATIC', logo: 'matic' },
  [Chain.Blast]: { ticker: 'BLAST', logo: 'blast' },
  [Chain.CronosChain]: { ticker: 'CRO', logo: 'cro' },
  [Chain.Zksync]: { ticker: 'ZK', logo: 'zksync' },
  [Chain.Dydx]: { ticker: 'DYDX', logo: 'dydx' },
  [Chain.Kujira]: { ticker: 'KUJI', logo: 'kuji' },
  [Chain.Terra]: { ticker: 'LUNA', logo: 'luna' },
  [Chain.TerraClassic]: { ticker: 'LUNC', logo: 'lunc' },
  [Chain.Sui]: { ticker: 'SUI', logo: 'sui' },
  [Chain.Polkadot]: { ticker: 'DOT', logo: 'dot' },
  [Chain.Noble]: { ticker: 'USDC', logo: 'usdc' },
  [Chain.Akash]: { ticker: 'AKT', logo: 'akash' },
  [Chain.Cosmos]: { ticker: 'ATOM', logo: 'atom' },
  [Chain.Osmosis]: { ticker: 'OSMO', logo: 'osmo' },
  [Chain.Tron]: { ticker: 'TRX', logo: 'tron' },
}

export const chainInfos: Record<
  Chain,
  Pick<Coin, 'ticker' | 'logo' | 'chain'>
> = recordMap(leanChainInfos, (coin, chain) => ({
  ...coin,
  chain,
  id: coin.ticker,
}))
