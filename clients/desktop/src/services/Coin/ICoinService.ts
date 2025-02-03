import { storage } from '../../../wailsjs/go/models';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';

export interface ICoinService {
  saveCoin(coin: Coin, vault: storage.Vault): Promise<void>;

  saveTokens(coin: Coin, vault: storage.Vault): Promise<void>;

  deleteCoin(coinId: string, vaultId: string): Promise<void>;
}
