import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { Rate } from '../../model/price-rate';
import { IPriceService } from './IPriceService';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { Endpoint } from '../Endpoint';
import { ChainRates, CurrencyRates } from '../../model/chain-rates';
import { StorageService, StoreName } from '../Storage/StorageService';

export class PriceService implements IPriceService {
  chain: Chain;
  walletCore: WalletCore;
  storageService: StorageService<{
    prices: Map<string, Rate[]>;
    expiryDate: Date;
  }>;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
    this.storageService = new StorageService<{
      prices: Map<string, Rate[]>;
      expiryDate: Date;
    }>(StoreName.PRICE);
  }

  async getPriceInFiat(
    coin: CoinMeta,
    amount: number,
    fiat: Fiat
  ): Promise<number> {
    const cacheKey = JSON.stringify(this.chain);
    const cachedData = await this.storageService.getFromStorage(cacheKey);

    if (!cachedData) {
      throw new Error(
        'You must initialize the prices before utilizing this conversor.'
      );
    }

    const { prices, expiryDate } = cachedData;
    if (new Date(expiryDate) > new Date()) {
      const rate = prices
        .get(CoinMeta.sortedStringify(coin))
        ?.find(rate => rate.fiat === fiat);
      if (rate) {
        return rate.value * amount;
      }
    }

    throw new Error(
      'You must initialize the prices before utilizing this conversor.'
    );
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
    const cacheKey = JSON.stringify(this.chain);

    // Check the cache first
    const cachedData = await this.storageService.getFromStorage(cacheKey);
    if (cachedData) {
      const { prices, expiryDate } = cachedData;
      if (new Date(expiryDate) > new Date()) {
        return prices;
      }
    }

    // Fetch the prices if not cached
    const nativeCoins = coins.filter(coin => coin.isNativeToken);
    const nativePrices = await this.getNativePrices(nativeCoins);

    // Cache the fetched prices with an expiration date
    const expiryDate = new Date(Date.now() + 60000 * 60); // 60 minutes
    await this.storageService.saveToStorage(cacheKey, {
      prices: nativePrices,
      expiryDate,
    });

    return nativePrices;
  }

  mapRates(response: ChainRates, coins: CoinMeta[]): Map<string, Rate[]> {
    const rates = new Map<string, Rate[]>();

    coins.forEach(coinMeta => {
      const fiatMap =
        coinMeta.isNativeToken && coinMeta.priceProviderId
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
              expiryDate: new Date(Date.now() + 60000 * 60),
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
      case Chain.ZkSync:
        return 'zksync';
      case Chain.THORChain:
      case Chain.Solana:
      case Chain.Bitcoin:
      case Chain.BitcoinCash:
      case Chain.Litecoin:
      case Chain.Dogecoin:
      case Chain.Dash:
      case Chain.Gaia:
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