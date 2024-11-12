import { useTranslation } from 'react-i18next';

import { DepositFiatFeeValue } from './DepositFiatFeeValue';
import { SendSpecificTxInfoProvider } from './DepositSpecificTxInfoProvider';

export const DepositFiatFee = () => {
  const { t } = useTranslation();

  return (
    <>
      <span>{t('network_fee')}</span>
      <SendSpecificTxInfoProvider>
        <DepositFiatFeeValue />
      </SendSpecificTxInfoProvider>
    </>
  );
};
