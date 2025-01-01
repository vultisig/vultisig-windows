import { useTranslation } from 'react-i18next';

import { SendChainSpecificProvider } from './SendChainSpecificProvider';
import { SendFiatFeeValue } from './SendFiatFeeValue';

export const SendFiatFee = () => {
  const { t } = useTranslation();

  return (
    <>
      <span>{t('network_fee')}</span>
      <SendChainSpecificProvider>
        <SendFiatFeeValue />
      </SendChainSpecificProvider>
    </>
  );
};
