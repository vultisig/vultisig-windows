import { ComponentType, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';

import { formatFee } from '../../../../chain/tx/fee/utils/formatFee';
import { Spinner } from '../../../../lib/ui/loaders/Spinner';
import { MatchQuery } from '../../../../lib/ui/query/components/MatchQuery';
import { useSwapFeesQuery } from '../../queries/useSwapFeesQuery';
import { SwapFeeFiatValue } from './SwapTotalFeeFiatValue';

interface SwapFeesProps {
  RowComponent: ComponentType<PropsWithChildren>;
}

export const SwapFees: React.FC<SwapFeesProps> = ({ RowComponent }) => {
  const { t } = useTranslation();

  const query = useSwapFeesQuery();

  return (
    <>
      <RowComponent>
        <span>{t('swap_fee')}</span>
        <MatchQuery
          value={query}
          pending={() => <Spinner />}
          error={() => <span>{t('failed_to_load')}</span>}
          success={({ swap }) => {
            return <SwapFeeFiatValue value={[swap]} />;
          }}
        />
      </RowComponent>
      <MatchQuery
        value={query}
        success={({ network }) => {
          if (!network) return null;

          return (
            <RowComponent>
              <span>{t('network_fee')}</span>
              <span>
                {formatFee(network)} (~
                <SwapFeeFiatValue value={[network]} />)
              </span>
            </RowComponent>
          );
        }}
      />
      <RowComponent>
        <span>{t('total_fee')}</span>
        <MatchQuery
          value={query}
          pending={() => <Spinner />}
          error={() => <span>{t('failed_to_load')}</span>}
          success={value => <SwapFeeFiatValue value={Object.values(value)} />}
        />
      </RowComponent>
    </>
  );
};
