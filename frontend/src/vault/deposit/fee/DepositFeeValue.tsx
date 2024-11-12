import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { StrictText } from '../../../lib/ui/text';
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin';
import { useSendSpecificTxInfo } from './DepositSpecificTxInfoProvider';

export const DepositFeeValue = () => {
  const txInfo = useSendSpecificTxInfo();
  const [coinKey] = useCurrentDepositCoin();
  const { chainId } = coinKey;

  return <StrictText>{formatFee({ chain: chainId, txInfo })}</StrictText>;
};
