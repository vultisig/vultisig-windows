import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { StrictText } from '../../../lib/ui/text';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendFeeValue = () => {
  const txInfo = useSendSpecificTxInfo();
  const [coinKey] = useCurrentSendCoin();
  const { chainId } = coinKey;

  return <StrictText>{formatFee({ chain: chainId, txInfo })}</StrictText>;
};
