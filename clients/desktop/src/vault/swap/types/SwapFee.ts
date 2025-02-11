import { CoinAmount, CoinKey } from '@core/chain/coin/Coin';

import { KeysignChainSpecific } from '../../../chain/keysign/KeysignChainSpecific';

export type SwapFee = CoinKey & CoinAmount;

export type SwapFees = {
  network?: SwapFee & { chainSpecific: KeysignChainSpecific };
  swap: SwapFee;
};
