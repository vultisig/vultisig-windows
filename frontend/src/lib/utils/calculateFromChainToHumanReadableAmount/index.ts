import { fromChainAmount } from '../../../chain/utils/fromChainAmount';

type Params = {
  amount: bigint | number | string;
  decimals: number;
};

export const calculateFromChainToHumanReadableAmount = ({
  amount,
  decimals,
}: Params) => fromChainAmount(BigInt(amount), decimals);
