import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';
import { Rate } from '../../model/price-rate';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { Endpoint } from '../Endpoint';

export class PriceServiceEvm extends PriceService implements IPriceService {
  chain: Chain;
  walletCore: WalletCore;

  constructor(chain: Chain, walletCore: WalletCore) {
    super(chain, walletCore);
    this.chain = chain;
    this.walletCore = walletCore;
  }

  async getPrices(coins: CoinMeta[]): Promise<Map<CoinMeta, Rate[]>> {
    console.log('getPrices', coins);

    const nativeCoins = coins.filter(
      coin => coin.isNativeToken && coin.priceProviderId
    );
    const tokenCoins = coins.filter(
      coin => !coin.isNativeToken && coin.contractAddress
    );

    const nativePricesPromise = this.getNativePrices(nativeCoins);
    const tokenPricesPromise = this.getTokenPrices(tokenCoins);

    const [nativePrices, tokenPrices] = await Promise.all([
      nativePricesPromise,
      tokenPricesPromise,
    ]);
    const prices = new Map([...nativePrices, ...tokenPrices]);

    return prices;
  }

  async getTokenPrices(coins: CoinMeta[]): Promise<Map<CoinMeta, Rate[]>> {
    const contractAddresses = coins.map(coin => coin.contractAddress);

    if (contractAddresses.length === 0) {
      console.error('No contractAddresses to fetch prices for', coins);
      return new Map();
    }

    const endpoint = Endpoint.fetchTokenPrice(
      this.coinGeckoPlatform(this.chain),
      contractAddresses,
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
}
