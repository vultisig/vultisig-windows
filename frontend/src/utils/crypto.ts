import { Chain } from '../model/chain';

export function convertChainSymbolToChain(symbol: string) {
  switch (symbol) {
    case 'ETH':
      return Chain.Ethereum;
    case 'BTC':
      return Chain.Bitcoin;
    case 'BCH':
      return Chain.BitcoinCash;
    case 'LTC':
      return Chain.Litecoin;
    case 'BNB':
      return 'BNB';
    case 'AVAX':
      return Chain.Avalanche;
    case 'THOR':
      return Chain.THORChain;
    case 'GAIA':
      return Chain.Cosmos;
    case 'KUJI':
      return Chain.Kujira;
    case 'ARB':
      return Chain.Arbitrum;
    case 'MAYA':
      return Chain.MayaChain;
    case 'DOGE':
      return Chain.Dogecoin;
    case 'DASH':
      return Chain.Dash;
    case 'BSC':
      return Chain.BSC;
    default:
      return symbol;
  }
}

export function convertChainToChainTicker(chain: Chain) {
  switch (chain) {
    case Chain.Ethereum:
      return 'ETH';
    case Chain.Bitcoin:
      return 'BTC';
    case Chain.BitcoinCash:
      return 'BCH';
    case Chain.Litecoin:
      return 'LTC';
    case Chain.Avalanche:
      return 'AVAX';
    case Chain.THORChain:
      return 'THOR';
    case Chain.Cosmos:
      return 'GAIA';
    case Chain.Kujira:
      return 'KUJI';
    case Chain.Arbitrum:
      return 'ARB';
    case Chain.MayaChain:
      return 'MAYA';
    case Chain.Dogecoin:
      return 'DOGE';
    case Chain.Dash:
      return 'DASH';
    default:
      return chain;
  }
}
