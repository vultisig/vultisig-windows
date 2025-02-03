import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { Rate } from '../../model/price-rate';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';

export class PriceServiceCosmos extends PriceService implements IPriceService {
  chain: Chain;

  constructor(chain: Chain) {
    super(chain);
    this.chain = chain;
  }

  async getPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
    // Fetch the prices if not cached
    const nativeCoins = coins.filter(coin => coin.priceProviderId);

    const [nativePrices] = await Promise.all([
      this.getNativePrices(nativeCoins),
    ]);

    const prices = new Map([...nativePrices]);

    return prices;
  }
}
