import { useTranslation } from 'react-i18next';

import { TxOverviewPrimaryRow } from '../../../chain/tx/components/TxOverviewPrimaryRow';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { useSwapKeysignPayloadQuery } from '../queries/useSwapKeysignPayloadQuery';

export const SwapAllowance = () => {
  const query = useSwapKeysignPayloadQuery();

  const { t } = useTranslation();

  return (
    <QueryDependant
      query={query}
      error={() => null}
      pending={() => null}
      success={({ erc20ApprovePayload, coin }) => {
        if (!erc20ApprovePayload) {
          return null;
        }

        const { decimals, ticker } = shouldBePresent(coin);

        return (
          <TxOverviewPrimaryRow title={t('allowance')}>
            {formatAmount(
              fromChainAmount(erc20ApprovePayload.amount, decimals),
              ticker
            )}
          </TxOverviewPrimaryRow>
        );
      }}
    />
  );
};
