import { useTranslation } from 'react-i18next';

import { SendFiatFeeValue } from '../send/fee/SendFiatFeeValue';
import { SendSpecificTxInfoProvider } from '../send/fee/SendSpecificTxInfoProvider';

export const DepositFiatFee = () => {
  const { t } = useTranslation();

  return (
    <>
      <span>{t('network_fee')}</span>
      <SendSpecificTxInfoProvider>
        <SendFiatFeeValue />
      </SendSpecificTxInfoProvider>
    </>
  );
};
