import { useTranslation } from 'react-i18next';

import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery';
import { SwapTotalFeeFiatValue } from './SwapTotalFeeFiatValue';

export const SwapTotalFee = () => {
  const { t } = useTranslation();

  const query = useSwapFeesQuery();

  return (
    <>
      <span>{t('estimated_fees')}</span>
      <MatchQuery
        value={query}
        error={() => null}
        pending={() => <Spinner />}
        success={value => <SwapTotalFeeFiatValue value={value} />}
      />
    </>
  );
};
