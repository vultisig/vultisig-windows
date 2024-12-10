import { useTranslation } from 'react-i18next';

import { SendFiatFeeValue } from './SendFiatFeeValue';
import { SendSpecificTxInfoProvider } from './SendSpecificTxInfoProvider';

export const SendFiatFee = () => {
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
