import { shouldBePresent } from '@lib/utils/assert/shouldBePresent';
import { queryUrl } from '@lib/utils/query/queryUrl';
import { toEntries } from '@lib/utils/record/toEntries';
import { areLowerCaseEqual } from '@lib/utils/string/areLowerCaseEqual';
import { Chain } from '../../model/chain';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { Rate } from '../../model/price-rate';
import { Endpoint } from '../Endpoint';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';

export class PriceServiceEvm extends PriceService implements IPriceService {
  chain: Chain;

  constructor(chain: Chain) {
    super(chain);
    this.chain = chain;
  }

  async getPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
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

    const response =
      await queryUrl<Record<string, Record<string, number>>>(endpoint);

    const rates = new Map<string, Rate[]>();

    toEntries(response).forEach(({ key: contractAddress, value: prices }) => {
      const coin = shouldBePresent(
        coins.find(coin =>
          areLowerCaseEqual(coin.contractAddress, contractAddress)
        )
      );

      const rateList: Rate[] = toEntries(prices).map(({ key, value }) => ({
        fiat: key.toUpperCase() as Fiat,
        value,
      }));

      rates.set(CoinMeta.sortedStringify(coin), rateList);
    });

    return rates;
  }
}
