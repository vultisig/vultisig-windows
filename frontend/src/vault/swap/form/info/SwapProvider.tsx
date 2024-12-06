import { useTranslation } from 'react-i18next';

import { StrictInfoRow } from '../../../../lib/ui/layout/StrictInfoRow';

export const SwapProvider = () => {
  const { t } = useTranslation();

  const providerName = 'THORChain';

  return (
    <StrictInfoRow>
      <span>{t('provider')}</span>
      <span>{providerName}</span>
    </StrictInfoRow>
  );
};
