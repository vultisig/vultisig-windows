import { useTranslation } from 'react-i18next';

import { SendFeeValue } from '../send/fee/SendFeeValue';
import { SendSpecificTxInfoProvider } from '../send/fee/SendSpecificTxInfoProvider';

export const DepositFee = () => {
  const { t } = useTranslation();

  return (
    <>
      <span>
        {t('gas')} ({t('auto')})
      </span>
      <SendSpecificTxInfoProvider>
        <SendFeeValue />
      </SendSpecificTxInfoProvider>
    </>
  );
};
