import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendFeeValue = () => {
  const txInfo = useSendSpecificTxInfo();
  const [coinKey] = useCurrentSendCoin();
  const { chain } = coinKey;

  return <>{formatFee({ chain: chain, txInfo })}</>;
};
