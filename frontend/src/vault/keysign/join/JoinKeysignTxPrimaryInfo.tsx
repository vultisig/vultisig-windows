import { useTranslation } from 'react-i18next';

import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { useCurrentJoinKeysignPayload } from './state/currentJoinKeysignMsg';
import { TxOverviewAddress } from './verify/TxOverviewAddress';
import { TxOverviewRow } from './verify/TxOverviewRow';

export const JoinKeysignTxPrimaryInfo = () => {
  const {
    coin: potentialCoin,
    toAddress,
    memo,
    toAmount,
  } = useCurrentJoinKeysignPayload();

  const coin = shouldBePresent(potentialCoin);

  const { decimals, ticker } = shouldBePresent(coin);

  const { t } = useTranslation();

  const coinPriceQuery = useCoinPriceQuery(CoinMeta.fromCoin(coin));

  const { globalCurrency } = useGlobalCurrency();

  return (
    <>
      <TxOverviewAddress title={t('to')} value={toAddress} />
      {memo && (
        <TxOverviewRow>
          <Text>{t('memo')}</Text>
          <Text weight="500" size={14}>
            {memo}
          </Text>
        </TxOverviewRow>
      )}
      <TxOverviewRow>
        <Text>{t('amount')}</Text>
        <Text family="mono">
          {formatAmount(fromChainAmount(toAmount, decimals))} {ticker}
        </Text>
      </TxOverviewRow>
      <QueryDependant
        query={coinPriceQuery}
        success={price =>
          price ? (
            <TxOverviewRow>
              <Text>{t('value')}</Text>
              <Text family="mono">
                {formatAmount(fromChainAmount(toAmount, decimals) * price)}{' '}
                {globalCurrency}
              </Text>
            </TxOverviewRow>
          ) : null
        }
        error={() => null}
        pending={() => null}
      />
    </>
  );
};
