import { useTranslation } from 'react-i18next';

import { getSwapQuoteProviderName } from '../../../../chain/swap/quote/getSwapQuoteProviderName';
import { StrictInfoRow } from '../../../../lib/ui/layout/StrictInfoRow';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery';

export const SwapProvider = () => {
  const { t } = useTranslation();

  const query = useSwapQuoteQuery();

  return (
    <StrictInfoRow>
      <span>{t('provider')}</span>
      <MatchQuery
        value={query}
        pending={() => <Spinner />}
        success={getSwapQuoteProviderName}
      />
    </StrictInfoRow>
  );
};
