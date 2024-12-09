import { useTranslation } from 'react-i18next';

import { StrictText } from '../../../lib/ui/text';
import { SendGasFeeValue } from './SendGasFeeValue';
import { SendSpecificTxInfoProvider } from './SendSpecificTxInfoProvider';

export const SendGasFeeWrapper = () => {
  const { t } = useTranslation();

  return (
    <>
      <span>
        {t('gas')} ({t('auto')})
      </span>
      <SendSpecificTxInfoProvider>
        <StrictText>
          <SendGasFeeValue />
        </StrictText>
      </SendSpecificTxInfoProvider>
    </>
  );
};
