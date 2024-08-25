import { WalletCore } from '@trustwallet/wallet-core';
import { Chain } from '../../model/chain';
import { Rate } from '../../model/price-rate';
import { IPriceService } from './IPriceService';
import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { Endpoint } from '../Endpoint';

export class PriceService implements IPriceService {
  chain: Chain;
  walletCore: WalletCore;

  constructor(chain: Chain, walletCore: WalletCore) {
    this.chain = chain;
    this.walletCore = walletCore;
  }

  async getNativePrices(coins: CoinMeta[]): Promise<Map<CoinMeta, Rate[]>> {
    const coinProviderIds = coins.map(coin => coin.priceProviderId);
    const endpoint = Endpoint.fetchCryptoPrices(
      coinProviderIds.join(','),
      Object.values(Fiat)
        .map(m => m.toLowerCase())
        .join(',')
        .toLowerCase()
    );

    const response = await fetch(endpoint);

    if (!response.ok) {
      throw new Error(`Failed to fetch prices from ${endpoint}`);
    }

    const json = await response.json();

    return this.mapRates(json, coins);
  }

  async getPrices(coins: CoinMeta[]): Promise<Map<CoinMeta, Rate[]>> {
    const nativeCoins = coins.filter(coin => coin.isNativeToken);
    const nativePricesPromise = this.getNativePrices(nativeCoins);
    return await nativePricesPromise;
  }

  // This function maps the API response to a Map of CoinMeta to Rate[].
  mapRates(
    response: { [key: string]: { [key: string]: number } },
    coins: CoinMeta[]
  ): Map<CoinMeta, Rate[]> {
    const rates = new Map<CoinMeta, Rate[]>();

    coins.forEach(coinMeta => {
      const fiatMap = response[coinMeta.priceProviderId];
      if (fiatMap) {
        const rateList: Rate[] = [];

        for (const fiat of Object.values(Fiat)) {
          if (fiatMap[fiat] !== undefined) {
            rateList.push({
              fiat,
              value: fiatMap[fiat.toLowerCase()],
              expiryDate: new Date(Date.now() + 60000 * 60),
            });
          }
        }

        rates.set(coinMeta, rateList);
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
