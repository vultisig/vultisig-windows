import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../model/coin-meta';
import { Chain } from '../../model/chain';

export interface ICoinService {
  createCoin(
    asset: CoinMeta,
    publicKeyECDSA: string,
    publicKeyEdDSA: string
  ): Promise<Coin>;

  getCoinType(chain: Chain): any;
}
