import { CoinAmount, CoinKey } from '@core/chain/coin/Coin';
import { KeysignChainSpecific } from '@core/keysign/chainSpecific/KeysignChainSpecific';

export type SwapFee = CoinKey & CoinAmount;

export type SwapFees = {
  network?: SwapFee & { chainSpecific: KeysignChainSpecific };
  swap: SwapFee;
};
