import { Chain } from '../../model/chain';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';
import { Rate } from '../../model/price-rate';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { Endpoint } from '../Endpoint';

export class PriceServiceEvm extends PriceService implements IPriceService {
  chain: Chain;

  constructor(chain: Chain) {
    super(chain);
    this.chain = chain;
  }

  async getPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
    // Fetch the prices if not cached
    const nativeCoins = coins.filter(
      coin => coin.isNativeToken && coin.priceProviderId
    );
    const tokenCoins = coins.filter(
      coin => !coin.isNativeToken && coin.contractAddress
    );

    const [nativePrices, tokenPrices] = await Promise.all([
      this.getNativePrices(nativeCoins),
      this.getTokenPrices(tokenCoins),
    ]);

    const prices = new Map([...nativePrices, ...tokenPrices]);

    return prices;
  }

  async getTokenPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
    const contractAddresses = coins.map(coin => coin.contractAddress);

    if (contractAddresses.length === 0) {
      return new Map();
    }

    const endpoint = Endpoint.fetchTokenPrice(
      this.coinGeckoPlatform(this.chain),
      contractAddresses,
      Object.values(Fiat)
        .map(m => m.toString().toLowerCase())
        .join(',')
    );

    const response = await fetch(endpoint);

    if (!response.ok) {
      console.error(`Failed to fetch prices from ${endpoint}`);
    }

    const json = await response.json();

    return this.mapRates(json, coins);
  }
}
