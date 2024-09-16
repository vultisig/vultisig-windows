import { Chain } from '../../model/chain';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';
import { Rate } from '../../model/price-rate';
import { CoinMeta } from '../../model/coin-meta';

export class PriceServiceSolana extends PriceService implements IPriceService {
  chain: Chain;

  constructor(chain: Chain) {
    super(chain);
    this.chain = chain;
  }

  async getPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
    const coinsAndTokens = coins.filter(
      coin => coin.priceProviderId
    );

    const [nativePrices] = await Promise.all([
      this.getNativePrices(coinsAndTokens)
    ]);

    const prices = new Map([...nativePrices]);

    return prices;
  }

}
