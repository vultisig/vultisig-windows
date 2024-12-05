import { useTranslation } from 'react-i18next';

import { StrictInfoRow } from '../../../../lib/ui/layout/StrictInfoRow';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery';
import { SwapProvider } from './SwapProvider';
import { SwapTotalFeeValue } from './SwapTotalFeeValue';

export const SwapInfo = () => {
  const query = useSwapQuoteQuery();

  const { t } = useTranslation();

  return (
    <QueryDependant
      query={query}
      error={() => null}
      pending={() => null}
      success={data => (
        <>
          <SwapProvider />
          <StrictInfoRow>
            <span>{t('estimated_fees')}</span>
            <SwapTotalFeeValue swapQuote={data} />
          </StrictInfoRow>
          <code>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </code>
        </>
      )}
    />
  );
};
