import { CoinMeta } from '../../model/coin-meta';
import { Fiat } from '../../model/fiat';
import { Rate } from '../../model/price-rate';

export interface IPriceService {
  getPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>>;
  getPriceInFiat(coin: CoinMeta, amount: number, fiat: Fiat): Promise<number>;
}
