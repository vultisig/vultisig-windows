import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import { TxOverviewAmount } from '../../../chain/tx/components/TxOverviewAmount';
import { TxOverviewMemo } from '../../../chain/tx/components/TxOverviewMemo';
import {
  TxOverviewChainDataRow,
  TxOverviewPrimaryRowTitle,
  TxOverviewRow,
} from '../../../chain/tx/components/TxOverviewRow';
import { formatFee } from '../../../chain/tx/fee/utils/formatFee';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { KeysignPayload } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { useGlobalCurrency } from '../../../lib/hooks/useGlobalCurrency';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { shouldBePresent } from '../../../lib/utils/assert/shouldBePresent';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { assertField } from '../../../lib/utils/record/assertField';
import { Chain } from '../../../model/chain';
import { CoinMeta } from '../../../model/coin-meta';

export const KeysignTxPrimaryInfo = ({
  value,
}: ComponentWithValueProps<KeysignPayload>) => {
  const { toAddress, memo, toAmount, blockchainSpecific } = value;

  const coin = assertField(value, 'coin');

  const { decimals, ticker } = shouldBePresent(coin);

  const { t } = useTranslation();

  const coinPriceQuery = useCoinPriceQuery(CoinMeta.fromCoin(coin));

  const { globalCurrency } = useGlobalCurrency();

  const networkFeesFormatted = useMemo(() => {
    if (!blockchainSpecific.value) return null;
    formatFee({
      chain: coin.chain as Chain,
      chainSpecific: blockchainSpecific,
    });
  }, [blockchainSpecific, coin.chain]);

  return (
    <>
      <TxOverviewChainDataRow>
        <TxOverviewPrimaryRowTitle>{t('from')}</TxOverviewPrimaryRowTitle>
        <span>{coin.address}</span>
      </TxOverviewChainDataRow>

      <TxOverviewChainDataRow>
        <TxOverviewPrimaryRowTitle>{t('to')}</TxOverviewPrimaryRowTitle>
        <span>{toAddress}</span>
      </TxOverviewChainDataRow>
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
              <span>{t('value')}</span>
              <span>
                {formatAmount(
                  fromChainAmount(BigInt(toAmount), decimals) * price,
                  globalCurrency
                )}
              </span>
            </TxOverviewRow>
          ) : null
        }
        error={() => null}
        pending={() => null}
      />
      {networkFeesFormatted && (
        <TxOverviewRow>
          <span>{t('network_fee')}</span>
          <span>{networkFeesFormatted}</span>
        </TxOverviewRow>
      )}
    </>
  );
};
