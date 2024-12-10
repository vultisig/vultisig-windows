import { storage } from '../../../wailsjs/go/models';
import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../model/coin-meta';

export interface ICoinService {
  createCoin(
    asset: CoinMeta,
    publicKeyECDSA: string,
    publicKeyEdDSA: string,
    hexChainCode: string
  ): Promise<Coin>;

  saveCoin(coin: Coin, vault: storage.Vault): Promise<void>;

  saveTokens(coin: Coin, vault: storage.Vault): Promise<void>;

  deleteCoin(coinId: string, vaultId: string): Promise<void>;

  hasTokens(): boolean;
}
