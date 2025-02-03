import { recordMap } from '@lib/utils/record/recordMap';
import { Chain } from '../model/chain';
import { CoinMeta } from '../model/coin-meta';

type ChainFeeCoinMeta = Omit<
  CoinMeta,
  'contractAddress' | 'isNativeToken' | 'chain'
>;

const leanChainFeeCoin: Record<Chain, ChainFeeCoinMeta> = {
  [Chain.Bitcoin]: {
    ticker: 'BTC',
    logo: 'btc',
    decimals: 8,
    priceProviderId: 'bitcoin',
  },
  [Chain.BitcoinCash]: {
    ticker: 'BCH',
    logo: 'bch',
    decimals: 8,
    priceProviderId: 'bitcoin-cash',
  },
  [Chain.Litecoin]: {
    ticker: 'LTC',
    logo: 'ltc',
    decimals: 8,
    priceProviderId: 'litecoin',
  },
  [Chain.Dogecoin]: {
    ticker: 'DOGE',
    logo: 'doge',
    decimals: 8,
    priceProviderId: 'dogecoin',
  },
  [Chain.Dash]: {
    ticker: 'DASH',
    logo: 'dash',
    decimals: 8,
    priceProviderId: 'dash',
  },
  [Chain.Ripple]: {
    ticker: 'XRP',
    logo: 'xrp',
    decimals: 6,
    priceProviderId: 'ripple',
  },
  [Chain.THORChain]: {
    ticker: 'RUNE',
    logo: 'rune',
    decimals: 8,
    priceProviderId: 'thorchain',
  },
  [Chain.MayaChain]: {
    ticker: 'CACAO',
    logo: 'cacao',
    decimals: 10,
    priceProviderId: 'cacao',
  },
  [Chain.Solana]: {
    ticker: 'SOL',
    logo: 'solana',
    decimals: 9,
    priceProviderId: 'solana',
  },
  [Chain.Ton]: {
    ticker: 'TON',
    logo: 'ton',
    decimals: 9,
    priceProviderId: 'the-open-network',
  },
  [Chain.Ethereum]: {
    ticker: 'ETH',
    logo: 'eth',
    decimals: 18,
    priceProviderId: 'ethereum',
  },
  [Chain.Avalanche]: {
    ticker: 'AVAX',
    logo: 'avax',
    decimals: 18,
    priceProviderId: 'avalanche-2',
  },
  [Chain.BSC]: {
    ticker: 'BNB',
    logo: 'bsc',
    decimals: 18,
    priceProviderId: 'binancecoin',
  },
  [Chain.Base]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
  },
  [Chain.Arbitrum]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
  },
  [Chain.Optimism]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
  },
  [Chain.Polygon]: {
    ticker: 'MATIC',
    logo: 'matic',
    decimals: 18,
    priceProviderId: 'matic-network',
  },
  [Chain.Blast]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
  },
  [Chain.CronosChain]: {
    ticker: 'CRO',
    logo: 'cro',
    decimals: 18,
    priceProviderId: 'crypto-com-chain',
  },
  [Chain.Zksync]: {
    ticker: 'ETH',
    logo: 'ethereum',
    decimals: 18,
    priceProviderId: 'ethereum',
  },
  [Chain.Dydx]: {
    ticker: 'DYDX',
    logo: 'dydx',
    decimals: 18,
    priceProviderId: 'dydx-chain',
  },
  [Chain.Kujira]: {
    ticker: 'KUJI',
    logo: 'kuji',
    decimals: 6,
    priceProviderId: 'kujira',
  },
  [Chain.Terra]: {
    ticker: 'LUNA',
    logo: 'luna',
    decimals: 6,
    priceProviderId: 'terra-luna-2',
  },
  [Chain.TerraClassic]: {
    ticker: 'LUNC',
    logo: 'lunc',
    decimals: 6,
    priceProviderId: 'terra-luna',
  },
  [Chain.Sui]: {
    ticker: 'SUI',
    logo: 'sui',
    decimals: 9,
    priceProviderId: 'sui',
  },
  [Chain.Polkadot]: {
    ticker: 'DOT',
    logo: 'dot',
    decimals: 10,
    priceProviderId: 'polkadot',
  },
  [Chain.Noble]: {
    ticker: 'USDC',
    logo: 'usdc',
    decimals: 6,
    priceProviderId: 'usd-coin',
  },
  [Chain.Akash]: {
    ticker: 'AKT',
    logo: 'akash',
    decimals: 6,
    priceProviderId: 'akash-network',
  },
  [Chain.Cosmos]: {
    ticker: 'ATOM',
    logo: 'atom',
    decimals: 6,
    priceProviderId: 'cosmos',
  },
  [Chain.Osmosis]: {
    ticker: 'OSMO',
    logo: 'osmo',
    decimals: 6,
    priceProviderId: 'osmosis',
  },
};

export const chainFeeCoin: Record<Chain, CoinMeta> = recordMap(
  leanChainFeeCoin,
  (meta, chain) => ({
    ...meta,
    chain,
    isNativeToken: true,
    contractAddress: '',
  })
);
