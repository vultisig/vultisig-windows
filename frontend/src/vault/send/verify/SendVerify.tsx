import { FC } from 'react';
import { useTranslation } from 'react-i18next';

import { TxOverviewMemo } from '../../../chain/tx/components/TxOverviewMemo';
import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel';
import { TxOverviewPrimaryRow } from '../../../chain/tx/components/TxOverviewPrimaryRow';
import { TxOverviewRow } from '../../../chain/tx/components/TxOverviewRow';
import { useFormatFiatAmount } from '../../../chain/ui/hooks/useFormatFiatAmount';
import { fromChainAmount } from '../../../chain/utils/fromChainAmount';
import { useCoinPriceQuery } from '../../../coin/query/useCoinPriceQuery';
import { storageCoinToCoin } from '../../../coin/utils/storageCoin';
import { VStack } from '../../../lib/ui/layout/Stack';
import { Spinner } from '../../../lib/ui/loaders/Spinner';
import { ComponentWithBackActionProps } from '../../../lib/ui/props';
import { MatchQuery } from '../../../lib/ui/query/components/MatchQuery';
import { Text } from '../../../lib/ui/text';
import { range } from '../../../lib/utils/array/range';
import { formatAmount } from '../../../lib/utils/formatAmount';
import { CoinMeta } from '../../../model/coin-meta';
import { PageContent } from '../../../ui/page/PageContent';
import { PageHeader } from '../../../ui/page/PageHeader';
import { PageHeaderBackButton } from '../../../ui/page/PageHeaderBackButton';
import { PageHeaderTitle } from '../../../ui/page/PageHeaderTitle';
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator';
import { useCurrentVaultCoin } from '../../state/currentVault';
import { SendFiatFee } from '../fee/SendFiatFeeWrapper';
import { SendGasFeeWrapper } from '../fee/SendGasFeeWrapper';
import { useSendCappedAmountQuery } from '../queries/useSendCappedAmountQuery';
import { useSender } from '../sender/hooks/useSender';
import { useSendMemo } from '../state/memo';
import { useSendReceiver } from '../state/receiver';
import { useCurrentSendCoin } from '../state/sendCoin';
import { SendConfirm } from './SendConfirm';
import { SendTerms } from './SendTerms';
import { sendTermsCount, SendTermsProvider } from './state/sendTerms';

export const SendVerify: FC<ComponentWithBackActionProps> = ({ onBack }) => {
  const { t } = useTranslation();
  const [coinKey] = useCurrentSendCoin();
  const sender = useSender();
  const coin = useCurrentVaultCoin(coinKey);
  const [receiver] = useSendReceiver();
  const [memo] = useSendMemo();
  const formatFiat = useFormatFiatAmount();
  const coinPriceQuery = useCoinPriceQuery(
    CoinMeta.fromCoin(storageCoinToCoin(coin))
  );

  const cappedAmountQuery = useSendCappedAmountQuery();

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewPrimaryRow title={t('from')}>
              {sender}
            </TxOverviewPrimaryRow>
            <TxOverviewPrimaryRow title={t('to')}>
              {receiver}
            </TxOverviewPrimaryRow>
            {memo && <TxOverviewMemo value={memo} />}

            <TxOverviewRow>
              <Text>{t('amount')}</Text>
              <Text family="mono">
                <MatchQuery
                  value={cappedAmountQuery}
                  error={() => <Text>{t('failed_to_load')}</Text>}
                  pending={() => <Spinner />}
                  success={({ amount, decimals }) =>
                    formatAmount(fromChainAmount(amount, decimals), coin.ticker)
                  }
                />
              </Text>
            </TxOverviewRow>

            <TxOverviewRow>
              <Text>{t('value')}</Text>
              <Text family="mono">
                <MatchQuery
                  value={cappedAmountQuery}
                  error={() => <Text>{t('failed_to_load')}</Text>}
                  pending={() => <Spinner />}
                  success={({ amount, decimals }) => (
                    <MatchQuery
                      value={coinPriceQuery}
                      error={() => <Text>{t('failed_to_load')}</Text>}
                      pending={() => <Spinner />}
                      success={coinPrice =>
                        formatFiat(
                          fromChainAmount(amount, decimals) * coinPrice
                        )
                      }
                    />
                  )}
                />
              </Text>
            </TxOverviewRow>

            <TxOverviewRow>
              <SendGasFeeWrapper />
            </TxOverviewRow>
            <TxOverviewRow>
              <SendFiatFee />
            </TxOverviewRow>
          </TxOverviewPanel>
        </WithProgressIndicator>
        <SendTermsProvider
          initialValue={range(sendTermsCount).map(() => false)}
        >
          <VStack gap={20}>
            <SendTerms />
            <SendConfirm />
          </VStack>
        </SendTermsProvider>
      </PageContent>
    </>
  );
};
