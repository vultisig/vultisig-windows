import { fromChainAmount } from '../../../chain/utils/fromChainAmount';

type Params = {
  amount: bigint | number | string;
  decimals: number;
};

export const calculateFromChainToHumanReadableAmount = ({
  amount,
  decimals,
}: Params) => {
  if (!amount || !decimals) {
    return null;
  }

  return fromChainAmount(BigInt(amount), decimals);
};
