import { useTranslation } from 'react-i18next';

import { SendFeeValue } from './SendFeeValue';
import { SendSpecificTxInfoProvider } from './SendSpecificTxInfoProvider';

export const SendFee = () => {
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
