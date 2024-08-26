import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { IPriceService } from './IPriceService';
import { PriceService } from './PriceService';
import { Rate } from '../../model/price-rate';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { StorageService, StoreName } from '../Storage/StorageService';
import { Endpoint } from '../Endpoint';

export class PriceServiceEvm extends PriceService implements IPriceService {
  chain: Chain;
  walletCore: WalletCore;

  constructor(chain: Chain, walletCore: WalletCore) {
    super(chain, walletCore);
    this.chain = chain;
    this.walletCore = walletCore;
    this.storageService = new StorageService<{
      prices: Map<string, Rate[]>;
      expiryDate: Date;
    }>(StoreName.PRICE);
  }

  async getPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
    const cacheKey = JSON.stringify(this.chain);

    if (this.storageService === null) {
      this.storageService = new StorageService<{
        prices: Map<string, Rate[]>;
        expiryDate: Date;
      }>(StoreName.PRICE);
    }

    // Check the cache first
    const cachedData = await this.storageService.getFromStorage(cacheKey);
    if (cachedData) {
      const { prices, expiryDate } = cachedData;
      if (new Date(expiryDate) > new Date()) {
        return prices;
      }
    }

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

    // Cache the fetched prices with an expiration date
    const expiryDate = new Date(Date.now() + 60000 * 60); // 60 minutes
    await this.storageService.saveToStorage(cacheKey, { prices, expiryDate });

    return prices;
  }

  async getTokenPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>> {
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
    );

    const response = await fetch(endpoint);

    if (!response.ok) {
      console.error(`Failed to fetch prices from ${endpoint}`);
    }

    const json = await response.json();

    return this.mapRates(json, coins);
  }
}
