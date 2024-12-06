import { useEffect } from 'react';

import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { useCurrentSendCoin } from '../state/sendCoin';
import { useSendFees } from '../state/sendFees';
import { useSendSpecificTxInfo } from './SendSpecificTxInfoProvider';

export const SendFeeValue = () => {
  const txInfo = useSendSpecificTxInfo();
  const [coinKey] = useCurrentSendCoin();

  const { chain } = coinKey;
  const fees = formatFee({ chain: chain, txInfo });
  const [, setFees] = useSendFees();

  useEffect(() => {
    setFees({
      totalFeesFormatted: fees,
    });
  }, [fees, setFees]);

  return fees;
};
