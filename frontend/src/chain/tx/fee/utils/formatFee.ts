import { formatAmount } from '../../../../lib/utils/formatAmount';
import { Chain, EvmChain } from '../../../../model/chain';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { gwei } from './evm';
import { getFeeUnit } from './feeUnit';
import { getChainFeeCoin } from './getChainFeeCoin';

type FormatFeeInput = {
  chain: Chain;
  amount: bigint;
};

export const formatFee = ({ chain, amount }: FormatFeeInput) => {
  const decimals =
    chain in EvmChain ? gwei.decimals : getChainFeeCoin(chain).decimals;

  return formatAmount(fromChainAmount(amount, decimals), getFeeUnit(chain));
};
