import { useTranslation } from 'react-i18next';

import { thorchainSwapConfig } from '../../../../chain/thor/swap/config';
import { fromThorchainSwapAsset } from '../../../../chain/thor/swap/utils/swapAsset';
import { fromChainAmount } from '../../../../chain/utils/fromChainAmount';
import { FiatAmount } from '../../../../coin/ui/FiatAmount';
import { StrictInfoRow } from '../../../../lib/ui/layout/StrictInfoRow';
import { QueryDependant } from '../../../../lib/ui/query/components/QueryDependant';
import { useSwapQuoteQuery } from '../../queries/useSwapQuoteQuery';

export const SwapInfo = () => {
  const query = useSwapQuoteQuery();

  const { t } = useTranslation();

  // TODO: make provider name dynamic when more providers enabled
  const providerName = 'THORChain';

  return (
    <QueryDependant
      query={query}
      error={() => null}
      pending={() => null}
      success={data => (
        <>
          <StrictInfoRow>
            <span>{t('provider')}</span>
            <span>{providerName}</span>
          </StrictInfoRow>
          <StrictInfoRow>
            <span>{t('estimated_fees')}</span>
            <FiatAmount
              coin={fromThorchainSwapAsset(data.fees.asset)}
              amount={fromChainAmount(
                data.fees.total,
                thorchainSwapConfig.decimals
              )}
            />
          </StrictInfoRow>
          <code>
            <pre>{JSON.stringify(data, null, 2)}</pre>
          </code>
        </>
      )}
    />
  );
};
