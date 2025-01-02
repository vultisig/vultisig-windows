import { formatAmount } from '../../../../lib/utils/formatAmount';
import { Chain, EvmChain } from '../../../../model/chain';
import { KeysignChainSpecific } from '../../../keysign/KeysignChainSpecific';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { gwei } from './evm';
import { getFeeUnit } from './feeUnit';
import { getChainFeeCoin } from './getChainFeeCoin';
import { getFeeAmount } from './getFeeAmount';

type FormatFeeInput = {
  chain: Chain;
  chainSpecific: KeysignChainSpecific;
};

export const formatFee = ({ chain, chainSpecific }: FormatFeeInput) => {
  const feeAmount = getFeeAmount(chainSpecific);

  const decimals =
    chain in EvmChain ? gwei.decimals : getChainFeeCoin(chain).decimals;

  const amount = fromChainAmount(feeAmount, decimals);

  return formatAmount(amount, getFeeUnit(chain));
};
