import { useTranslation } from 'react-i18next';

import { formatFee } from '../../../../chain/tx/fee/utils/formatFee';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery';

export const SwapNetworkFee = () => {
  const { t } = useTranslation();

  const query = useSwapFeesQuery();

  return (
    <>
      <span>{t('network_fee')}</span>
      <MatchQuery
        value={query}
        error={() => null}
        pending={() => <Spinner />}
        success={({ network }) => <span>{formatFee(network)}</span>}
      />
    </>
  );
};
