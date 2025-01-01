import { useTranslation } from 'react-i18next';

import { StrictText } from '../../../lib/ui/text';
import { SendChainSpecificProvider } from './SendChainSpecificProvider';
import { SendGasFeeValue } from './SendGasFeeValue';

export const SendGasFeeWrapper = () => {
  const { t } = useTranslation();

  return (
    <>
      <span>
        {t('gas')} ({t('auto')})
      </span>
      <SendChainSpecificProvider>
        <StrictText>
          <SendGasFeeValue />
        </StrictText>
      </SendChainSpecificProvider>
    </>
  );
};
