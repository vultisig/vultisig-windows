import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Rate } from '../../model/price-rate';

export interface IPriceService {
  getPriceRates(coin: Coin): Promise<Map<Coin, Rate>>;
  getPriceProviderId(coin: Coin): string;
}
