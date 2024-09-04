import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { Vault } from '../../gen/vultisig/vault/v1/vault_pb';
import { CoinMeta } from '../../model/coin-meta';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

export interface ICoinService {
  createCoin(
    asset: CoinMeta,
    publicKeyECDSA: string,
    publicKeyEdDSA: string,
    hexChainCode: string
  ): Promise<Coin>;

  getCoinType(): CoinType;

  saveCoin(coin: Coin, vault: Vault): Promise<void>;
}
