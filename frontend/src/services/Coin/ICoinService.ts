import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../model/coin-meta';
import { CoinType } from '@trustwallet/wallet-core/dist/src/wallet-core';

export interface ICoinService {
  createCoin(
    asset: CoinMeta,
    publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<Coin>;

  getCoinType(): CoinType;
}
