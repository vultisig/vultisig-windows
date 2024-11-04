import { SendSpecificTxInfoProvider } from './SendSpecificTxInfoProvider';
import TotalFeeUsd from './TotalFeeUsd';

export default function TotalFee() {
  return (
    <SendSpecificTxInfoProvider>
      <TotalFeeUsd />
    </SendSpecificTxInfoProvider>
  );
}
