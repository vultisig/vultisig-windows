import { DepositPageController } from './DepositPageController';
import { DepositChainSpecificProvider } from './fee/DepositSpecificTxInfoProvider';

export const DepositPage = () => (
  <DepositChainSpecificProvider>
    <DepositPageController />
  </DepositChainSpecificProvider>
);
