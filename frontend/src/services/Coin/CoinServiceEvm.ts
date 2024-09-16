import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { ICoinService } from './ICoinService';
import { CoinService } from './CoinService';
import { storage } from '../../../wailsjs/go/models';

export class CoinServiceEvm extends CoinService implements ICoinService {
  async saveCoin(coin: Coin, vault: storage.Vault): Promise<void> {
    //TODO: implement the auto discory tokens
    super.saveCoin(coin, vault);
  }
}
