import { UtxoChain } from '@core/chain/Chain';
import { isOneOf } from '@lib/utils/array/isOneOf';
import { minBigInt } from '@lib/utils/math/minBigInt';

import { isNativeCoin } from '../../../chain/utils/isNativeCoin';
import { CoinKey } from '../../../coin/Coin';

export type CapSendAmountToMaxInput = {
  coin: CoinKey;
  amount: bigint;
  fee: bigint;
  balance: bigint;
};

export const capSendAmountToMax = ({
  coin,
  amount,
  fee,
  balance,
}: CapSendAmountToMaxInput) => {
  if (!isNativeCoin(coin)) {
    return amount;
  }

  if (isOneOf(coin.chain, Object.values(UtxoChain))) {
    return amount;
  }

  return minBigInt(amount, balance - fee);
};
