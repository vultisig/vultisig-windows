import { assertChainField } from '../../../chain/utils/assertChainField';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { isOneOf } from '../../../lib/utils/array/isOneOf';
import { minBigInt } from '../../../lib/utils/math/minBigInt';
import { maxSendAmountEnabledChains } from '../../../model/chain';

export type CapSendAmountToMaxInput = {
  coin: Coin;
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
  if (!coin.isNativeToken) {
    return amount;
  }

  const { chain } = assertChainField(coin);

  if (isOneOf(chain, maxSendAmountEnabledChains)) {
    return amount;
  }

  return minBigInt(amount, balance - fee);
};
