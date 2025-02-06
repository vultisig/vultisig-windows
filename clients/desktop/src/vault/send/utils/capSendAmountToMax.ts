import { isOneOf } from '@lib/utils/array/isOneOf';
import { minBigInt } from '@lib/utils/math/minBigInt';

import { assertChainField } from '../../../chain/utils/assertChainField';
import { isNativeCoin } from '../../../chain/utils/isNativeCoin';
import { CoinKey } from '../../../coin/Coin';
import { maxSendAmountEnabledChains } from '../../../model/chain';

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

  const { chain } = assertChainField(coin);

  if (isOneOf(chain, maxSendAmountEnabledChains)) {
    return amount;
  }

  return minBigInt(amount, balance - fee);
};
