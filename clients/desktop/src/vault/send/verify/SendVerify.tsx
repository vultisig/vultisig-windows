import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import {
  TxOverviewChainDataRow,
  TxOverviewPrimaryRowTitle,
  TxOverviewRow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'

import { useFormatFiatAmount } from '../../../chain/ui/hooks/useFormatFiatAmount'
import { SendFiatFee } from '../fee/SendFiatFeeWrapper'
import { SendGasFeeWrapper } from '../fee/SendGasFeeWrapper'
import { useSendCappedAmountQuery } from '../queries/useSendCappedAmountQuery'
import { useSender } from '../sender/hooks/useSender'
import { useSendMemo } from '../state/memo'
import { useSendReceiver } from '../state/receiver'
import { useCurrentSendCoin } from '../state/sendCoin'
import { SendConfirm } from './SendConfirm'
import { SendTerms } from './SendTerms'
import { sendTerms, SendTermsProvider } from './state/sendTerms'

export const SendVerify: FC<OnBackProp> = ({ onBack }) => {
  const { t } = useTranslation()
  const [coinKey] = useCurrentSendCoin()
  const sender = useSender()
  const coin = useCurrentVaultCoin(coinKey)
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const formatFiat = useFormatFiatAmount()

  const coinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const cappedAmountQuery = useSendCappedAmountQuery()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewChainDataRow>
              <TxOverviewPrimaryRowTitle>{t('from')}</TxOverviewPrimaryRowTitle>
              <span>{sender}</span>
            </TxOverviewChainDataRow>
            <TxOverviewChainDataRow>
              <TxOverviewPrimaryRowTitle>{t('to')}</TxOverviewPrimaryRowTitle>
              {receiver}
            </TxOverviewChainDataRow>
            {memo && <TxOverviewMemo value={memo} />}

            <TxOverviewRow>
              <span>{t('amount')}</span>
              <span>
                <MatchQuery
                  value={cappedAmountQuery}
                  error={() => <Text>{t('failed_to_load')}</Text>}
                  pending={() => <Spinner />}
                  success={({ amount, decimals }) =>
                    formatTokenAmount(
                      fromChainAmount(amount, decimals),
                      coin.ticker
                    )
                  }
                />
              </span>
            </TxOverviewRow>

            <TxOverviewRow>
              <span>{t('value')}</span>
              <span>
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
              </span>
            </TxOverviewRow>

            <TxOverviewRow>
              <SendGasFeeWrapper />
            </TxOverviewRow>
            <TxOverviewRow>
              <SendFiatFee />
            </TxOverviewRow>
          </TxOverviewPanel>
        </WithProgressIndicator>
        <SendTermsProvider initialValue={sendTerms.map(() => false)}>
          <VStack gap={20}>
            <SendTerms />
            <SendConfirm />
          </VStack>
        </SendTermsProvider>
      </PageContent>
    </>
  )
}
