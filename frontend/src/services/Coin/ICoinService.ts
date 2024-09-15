import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../model/coin-meta';

export interface ICoinService {
  createCoin(
    asset: CoinMeta,
    publicKeyECDSA: string,
    publicKeyEdDSA: string,
    hexChainCode: string
  ): Promise<Coin>;

  getCoinType(): CoinType;

  saveCoin(coin: Coin, vaultId: string): Promise<void>;

  deleteCoin(coinId: string, vaultId: string): Promise<void>;

  hasTokens(): boolean;
}
