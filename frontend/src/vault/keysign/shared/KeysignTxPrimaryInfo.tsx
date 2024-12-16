import { useTranslation } from 'react-i18next';

import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewMemo } from '../../../chain/tx/components/TxOverviewMemo';
import { TxOverviewPrimaryRow } from '../../../chain/tx/components/TxOverviewPrimaryRow';
import { TxOverviewRow } from '../../../chain/tx/components/TxOverviewRow';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { Text } from '../../../lib/ui/text';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { KeysignTxOverviewRow } from './KeysignTxOverviewRow';
import { useKeysignPayload } from './state/keysignPayload';
import { extractAndFormatFees } from './utils/extractAndFormatFees';

export const KeysignTxPrimaryInfo = () => {
  const {
    coin: potentialCoin,
    toAddress,
    memo,
    toAmount,
    blockchainSpecific,
  } = useKeysignPayload();

  const coin = shouldBePresent(potentialCoin);

  const { decimals, ticker } = shouldBePresent(coin);

  const { t } = useTranslation();

  const coinPriceQuery = useCoinPriceQuery(CoinMeta.fromCoin(coin));

  const { globalCurrency } = useGlobalCurrency();

  const fees = extractAndFormatFees({
    blockchainSpecific,
    currency: globalCurrency,
    decimals: decimals,
  });

  return (
    <>
      <TxOverviewPrimaryRow title={t('to')}>{toAddress}</TxOverviewPrimaryRow>
      {memo && <TxOverviewMemo value={memo} />}
      <TxOverviewAmount
        value={fromChainAmount(BigInt(toAmount), decimals)}
        ticker={ticker}
      />
      <MatchQuery
        value={coinPriceQuery}
        success={price =>
          price ? (
            <TxOverviewRow>
              <Text>{t('value')}</Text>
              <Text family="mono">
                {formatAmount(
                  fromChainAmount(BigInt(toAmount), decimals) * price,
                  globalCurrency
                )}
              </Text>
            </TxOverviewRow>
          ) : null
        }
        error={() => null}
        pending={() => null}
      />
      {fees.networkFeesFormatted && (
        <KeysignTxOverviewRow
          label={t('network_fee')}
          value={fees.networkFeesFormatted}
        />
      )}
      {fees.totalFeesFormatted && (
        <KeysignTxOverviewRow
          label={t('total_fee')}
          value={fees.totalFeesFormatted}
        />
      )}
    </>
  );
};
