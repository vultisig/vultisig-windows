import { DepositPageController } from './DepositPageController';
import { DepositChainSpecificProvider } from './fee/DepositChainSpecificProvider';

export const DepositPage = () => (
  <DepositChainSpecificProvider>
    <DepositPageController />
  </DepositChainSpecificProvider>
);
