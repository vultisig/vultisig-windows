import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { StrictText } from '../../../lib/ui/text';
import { useCurrentSwapCoin } from '../state/swapCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendFeeValue = () => {
  const txInfo = useSendSpecificTxInfo();
  const [coinKey] = useCurrentSwapCoin();
  const { chainId } = coinKey;
  console.log(coinKey);
  console.log(chainId);
  console.log(txInfo);

  return <StrictText>{formatFee({ chain: chainId, txInfo })}</StrictText>;
};
