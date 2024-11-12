import { useTranslation } from 'react-i18next';

import { DepositFeeValue } from './DepositFeeValue';
import { SendSpecificTxInfoProvider } from './DepositSpecificTxInfoProvider';

export const DepositFee = () => {
  const { t } = useTranslation();

  return (
    <>
      <span>
        {t('gas')} ({t('auto')})
      </span>
      <SendSpecificTxInfoProvider>
        <DepositFeeValue />
      </SendSpecificTxInfoProvider>
    </>
  );
};
