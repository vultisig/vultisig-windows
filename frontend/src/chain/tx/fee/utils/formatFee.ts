import { formatAmount } from '../../../../lib/utils/formatAmount';
import { Chain, EvmChain } from '../../../../model/chain';
import { SpecificTransactionInfo } from '../../../../model/specific-transaction-info';
import { fromChainAmount } from '../../../utils/fromChainAmount';
import { gweiDecimals } from './evm';
import { getFeeUnit } from './feeUnit';
import { getChainFeeCoin } from './getChainFeeCoin';
import { getFeeAmount } from './getFeeAmount';

type FormatFeeInput = {
  chain: Chain;
  txInfo: SpecificTransactionInfo;
};

export const formatFee = ({ chain, txInfo }: FormatFeeInput) => {
  const feeAmount = getFeeAmount[chain](txInfo);

  const decimals =
    chain in EvmChain ? gweiDecimals : getChainFeeCoin(chain).decimals;

  const amount = fromChainAmount(feeAmount, decimals);

  return formatAmount(amount, getFeeUnit(chain));
};
