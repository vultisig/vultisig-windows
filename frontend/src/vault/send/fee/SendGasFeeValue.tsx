import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendGasFeeValue = () => {
  const txInfo = useSendSpecificTxInfo();
  const [coinKey] = useCurrentSendCoin();
  const { chain } = coinKey;
  const fees = formatFee({ chain: chain, txInfo });

  return <>{fees}</>;
};
