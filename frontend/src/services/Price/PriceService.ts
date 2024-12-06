import { Chain } from '../../model/chain';
import { ChainRates, CurrencyRates } from '../../model/chain-rates';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { Rate } from '../../model/price-rate';
import { Endpoint } from '../Endpoint';
import { IPriceService } from './IPriceService';

export class PriceService implements IPriceService {
  chain: Chain;

  constructor(chain: Chain) {
    this.chain = chain;
  }

  async getNativePrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
    const coinProviderIds = coins.map(coin => coin.priceProviderId);

    if (coinProviderIds.length === 0) {
      console.error('No coinProviderIds to fetch prices for', coins);
      return new Map();
    }

    const endpoint = Endpoint.fetchCryptoPrices(
      coinProviderIds.join(','),
      Object.values(Fiat)
        .map(m => m.toString().toLowerCase())
        .join(',')
        .toLowerCase()
    );

    const response = await fetch(endpoint);

    if (!response.ok) {
      console.error(`Failed to fetch prices from ${endpoint}`);
    }

    const json = await response.json();

    return this.mapRates(json, coins);
  }

  async getPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
    // Fetch the prices if not cached
    const nativeCoins = coins.filter(coin => coin.isNativeToken);
    const nativePrices = await this.getNativePrices(nativeCoins);

    return nativePrices;
  }

  mapRates(response: ChainRates, coins: CoinMeta[]): Map<string, Rate[]> {
    const rates = new Map<string, Rate[]>();

    coins.forEach(coinMeta => {
      const fiatMap = coinMeta.priceProviderId
        ? response[coinMeta.priceProviderId]
        : response[coinMeta.contractAddress];

      if (fiatMap) {
        const rateList: Rate[] = [];

        for (const fiat of Object.values(Fiat)) {
          const lowerCaseFiat = fiat.toLowerCase();
          if (fiatMap[lowerCaseFiat as keyof CurrencyRates] !== undefined) {
            rateList.push({
              fiat,
              value: fiatMap[lowerCaseFiat as keyof CurrencyRates],
            });
          }
        }

        rates.set(CoinMeta.sortedStringify(coinMeta), rateList);
      }
    });

    return rates;
  }

  coinGeckoPlatform(chain: Chain): string {
    switch (chain) {
      case Chain.Ethereum:
        return 'ethereum';
      case Chain.Avalanche:
        return 'avalanche';
      case Chain.Base:
        return 'base';
      case Chain.Blast:
        return 'blast';
      case Chain.Arbitrum:
        return 'arbitrum-one';
      case Chain.Polygon:
        return 'polygon-pos';
      case Chain.Optimism:
        return 'optimistic-ethereum';
      case Chain.BSC:
        return 'binance-smart-chain';
      case Chain.Zksync:
        return 'zksync';
      case Chain.THORChain:
      case Chain.Solana:
      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Litecoin:
      case Chain.Dogecoin:
      case Chain.Dash:
      case Chain.Cosmos:
      case Chain.Kujira:
      case Chain.MayaChain:
      case Chain.CronosChain:
      case Chain.Polkadot:
      case Chain.Dydx:
      case Chain.Sui:
        return '';
      default:
        return '';
    }
  }
}
