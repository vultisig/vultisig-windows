import { useTranslation } from 'react-i18next';

import { TxOverviewAddress } from '../../../chain/tx/components/TxOverviewAddress';
import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewRow } from '../../../chain/tx/components/TxOverviewRow';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { QueryDependant } from '../../../lib/ui/query/components/QueryDependant';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { useKeysignPayload } from './state/keysignPayload';

export const KeysignTxPrimaryInfo = () => {
  const {
    coin: potentialCoin,
    toAddress,
    memo,
    toAmount,
  } = useKeysignPayload();

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
      <TxOverviewAmount
        value={fromChainAmount(toAmount, decimals)}
        symbol={ticker}
      />
      <QueryDependant
        query={coinPriceQuery}
        success={price =>
          price ? (
            <TxOverviewRow>
              <Text>{t('value')}</Text>
              <Text family="mono">
                {formatAmount(
                  fromChainAmount(toAmount, decimals) * price,
                  globalCurrency
                )}
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
