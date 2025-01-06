import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';
import { CoinAmount, CoinKey } from '../../../coin/Coin';

export type SwapFee = CoinKey & CoinAmount;

export type SwapFees = {
  network?: SwapFee & { chainSpecific: KeysignChainSpecific };
  swap: SwapFee;
};
