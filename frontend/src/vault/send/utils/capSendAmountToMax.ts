import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { toChainAmount } from '../../../chain/utils/toChainAmount';
import { Coin } from '../../../gen/vultisig/keysign/v1/coin_pb';
import { EvmChain } from '../../../model/chain';

type Input = {
  coin: Coin;
  amount: number;
  fee: number;
};

export const capSendAmountToMax = ({ coin, amount, fee }: Input) => {
  if (!coin.isNativeToken) {
    return amount;
  }

  const isEvmChain = coin.chain in EvmChain;
  if (!isEvmChain) {
    return amount;
  }

  const chainAmount = toChainAmount(amount, coin.decimals);

  return fromChainAmount(Number(chainAmount) - fee, coin.decimals);
};
