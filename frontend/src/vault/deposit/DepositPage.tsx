import { DepositPageController } from './DepositPageController';
import { DepositSpecificTxInfoProvider } from './fee/DepositSpecificTxInfoProvider';

export const DepositPage = () => (
  <DepositSpecificTxInfoProvider>
    <DepositPageController />
  </DepositSpecificTxInfoProvider>
);
