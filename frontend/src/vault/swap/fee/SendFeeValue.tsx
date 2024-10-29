import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { StrictText } from '../../../lib/ui/text';
import { useCurrentSwapCoin } from '../state/swapCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendFeeValue = () => {
  const txInfo = useSendSpecificTxInfo();
  const [coinKey] = useCurrentSwapCoin();
  const { chainId } = coinKey;

  return <StrictText>{formatFee({ chain: chainId, txInfo })}</StrictText>;
};
