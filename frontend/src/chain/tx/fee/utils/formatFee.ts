import { formatAmount } from '../../../../lib/utils/formatAmount';
import { Chain } from '../../../../model/chain';
import { KeysignChainSpecific } from '../../../keysign/KeysignChainSpecific';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { getFeeUnit } from './feeUnit';
import { getFeeAmount } from './getFeeAmount';
import { getFeeAmountDecimals } from './getFeeAmountDecimals';

type FormatFeeInput = {
  chain: Chain;
  chainSpecific: KeysignChainSpecific;
};

export const formatFee = ({ chain, chainSpecific }: FormatFeeInput) => {
  const feeAmount = getFeeAmount(chainSpecific);

  const decimals = getFeeAmountDecimals(chain);

  const amount = fromChainAmount(feeAmount, decimals);

  return formatAmount(amount, getFeeUnit(chain));
};
