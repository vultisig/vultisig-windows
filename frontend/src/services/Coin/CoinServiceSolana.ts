import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { ICoinService } from './ICoinService';
import { CoinService } from './CoinService';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';

export class CoinServiceSolana extends CoinService implements ICoinService {
  async saveCoin(coin: Coin, vault: Vault): Promise<void> {
    //TODO: implement the auto discory tokens
    super.saveCoin(coin, vault);
  }
}
