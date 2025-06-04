import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { capitalizeFirstLetter } from '@lib/utils/capitalizeFirstLetter'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { ChainEntityIcon } from '../../../chain/coin/icon/ChainEntityIcon'
import { getChainLogoSrc } from '../../../chain/metadata/getChainLogoSrc'
import { useCurrentVault } from '../../state/currentVault'
import { SendFiatFee } from '../fee/SendFiatFeeWrapper'
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
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const sender = useSender()
  const { name } = useCurrentVault()
  const coin = useCurrentVaultCoin(coinKey)
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const cappedAmountQuery = useSendCappedAmountQuery()

  const { chain, ticker } = coin

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('send_overview')}</PageHeaderTitle>}
      />
      <PageContent gap={12}>
        <TxOverviewPanel>
          <AmountWrapper gap={24}>
            <Text size={15} color="supporting">
              {t('you_are_sending')}
            </Text>
            <HStack gap={8}>
              <CoinIcon coin={coin} style={{ fontSize: 32 }} />
              <Text size={17}>
                <MatchQuery
                  value={cappedAmountQuery}
                  error={() => <Text>{t('failed_to_load')}</Text>}
                  pending={() => <Spinner />}
                  success={({ amount, decimals }) =>
                    formatTokenAmount(fromChainAmount(amount, decimals))
                  }
                />
                <Text as="span" color="shy">
                  {ticker}
                </Text>
              </Text>
            </HStack>
          </AmountWrapper>
          <TxOverviewRow>
            <RowTitle>{t('from')}</RowTitle>
            <Text size={14}>
              {name}{' '}
              <Text size={14} as="span" color="shy">
                ({formatWalletAddress(sender)})
              </Text>
            </Text>
          </TxOverviewRow>
          <TxOverviewRow>
            <RowTitle>{t('to')}</RowTitle>
            <Text size={14}>{receiver}</Text>
          </TxOverviewRow>
          <TxOverviewRow>
            <RowTitle>{capitalizeFirstLetter(t('network'))}</RowTitle>
            <HStack gap={8}>
              <ChainEntityIcon
                value={getChainLogoSrc(chain)}
                style={{ fontSize: 16 }}
              />
              <Text size={14}>{chain}</Text>
            </HStack>
          </TxOverviewRow>
          {memo && <TxOverviewMemo value={memo} />}
          <TxOverviewRow>
            <SendFiatFee />
          </TxOverviewRow>
        </TxOverviewPanel>
        <SendTermsProvider initialValue={sendTerms.map(() => false)}>
          <SendTerms />
          <VStack
            style={{
              marginTop: 'auto',
            }}
            gap={20}
          >
            <SendConfirm />
          </VStack>
        </SendTermsProvider>
      </PageContent>
    </>
  )
}

const AmountWrapper = styled(VStack)`
  padding-bottom: 20px !important;
  margin-bottom: 12px;
`

const RowTitle = styled(Text)`
  font-size: 13px;
  color: ${getColor('textShy')};
`
