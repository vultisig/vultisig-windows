import { CoinMeta } from '../../model/coin-meta';
import { Rate } from '../../model/price-rate';

export interface IPriceService {
  getPrices(coins: CoinMeta[]): Promise<Map<string, Rate[]>>;
}
