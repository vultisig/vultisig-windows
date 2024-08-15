import { Coin } from '../../gen/vultisig/keysign/v1/coin_pb';
import { CoinMeta } from '../../model/coin-meta';

export interface ITokenService {
  getTokens(nativeToken: Coin): Promise<CoinMeta[]>;
}
