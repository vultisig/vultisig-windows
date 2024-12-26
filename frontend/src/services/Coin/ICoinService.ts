import { storage } from '../../../wailsjs/go/models';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../model/coin-meta';
import { VaultPublicKey } from '../../vault/publicKey/VaultPublicKey';

export interface ICoinService {
  createCoin(asset: CoinMeta, vaultPublicKey: VaultPublicKey): Promise<Coin>;

  saveCoin(coin: Coin, vault: storage.Vault): Promise<void>;

  saveTokens(coin: Coin, vault: storage.Vault): Promise<void>;

  deleteCoin(coinId: string, vaultId: string): Promise<void>;

  hasTokens(): boolean;
}
