import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { minBigInt } from '../../../lib/utils/math/minBigInt';
import { EvmChain } from '../../../model/chain';

type Input = {
  coin: Coin;
  amount: bigint;
  fee: bigint;
  balance: bigint;
};

export const capSendAmountToMax = ({ coin, amount, fee, balance }: Input) => {
  if (!coin.isNativeToken) {
    return amount;
  }

  const isEvmChain = coin.chain in EvmChain;
  if (!isEvmChain) {
    return amount;
  }

  return minBigInt(amount, balance - fee);
};
