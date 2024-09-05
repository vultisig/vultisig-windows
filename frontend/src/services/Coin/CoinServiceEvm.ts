import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { ICoinService } from './ICoinService';
import { CoinService } from './CoinService';

export class CoinServiceEvm extends CoinService implements ICoinService {
  async saveCoin(coin: Coin, vaultId: string): Promise<void> {
    //TODO: implement the auto discory tokens
    super.saveCoin(coin, vaultId);
  }
}
