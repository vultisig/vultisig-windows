import { Chain } from '../../model/chain';
import { CoinService } from './CoinService';

export class CoinServiceFactory {
  static createCoinService(chain: Chain) {
    return new CoinService(chain);
  }
}
