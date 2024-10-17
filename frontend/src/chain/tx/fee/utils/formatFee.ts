import { formatAmount } from '../../../../lib/utils/formatAmount';
import { Chain } from '../../../../model/chain';
import { SpecificTransactionInfo } from '../../../../model/specific-transaction-info';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { getFeeAmountDecimals, getFeeAmountRecord } from './feeAmount';
import { getFeeUnit } from './feeUnit';

type FormatFeeInput = {
  chain: Chain;
  txInfo: SpecificTransactionInfo;
};

export const formatFee = ({ chain, txInfo }: FormatFeeInput) => {
  const getFeeAmount = getFeeAmountRecord[chain];

  const feeAmount = getFeeAmount(txInfo);

  const decimals = getFeeAmountDecimals(chain);

  const amount = fromChainAmount(feeAmount, decimals);

  return formatAmount(amount, getFeeUnit(chain));
};
