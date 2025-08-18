import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { ChainEntityIcon } from '@core/ui/chain/coin/icon/ChainEntityIcon'
import { CoinIcon } from '@core/ui/chain/coin/icon/CoinIcon'
import { getChainLogoSrc } from '@core/ui/chain/metadata/getChainLogoSrc'
import { TxOverviewMemo } from '@core/ui/chain/tx/TxOverviewMemo'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { TxOverviewRow } from '@core/ui/chain/tx/TxOverviewRow'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { SendFiatFee } from '@core/ui/vault/send/fee/SendFiatFeeWrapper'
import { useSendCappedAmountQuery } from '@core/ui/vault/send/queries/useSendCappedAmountQuery'
import { useSender } from '@core/ui/vault/send/sender/hooks/useSender'
import { useSendMemo } from '@core/ui/vault/send/state/memo'
import { useSendReceiver } from '@core/ui/vault/send/state/receiver'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { formatWalletAddress } from '@lib/utils/formatWalletAddress'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VerifyKeysignStart } from '../../../mpc/keysign/start/VerifyKeysignStart'
import { useSendTxKeysignPayloadQuery } from '../state/useSendTxKeysignPayloadQuery'

const sendTerms = ['send_terms_1', 'send_terms_0'] as const

export const SendVerify: FC<OnBackProp> = ({ onBack }) => {
  const { t } = useTranslation()
  const coin = useCurrentSendCoin()
  const sender = useSender()
  const { name } = useCurrentVault()
  const [receiver] = useSendReceiver()
  const [memo] = useSendMemo()
  const cappedAmountQuery = useSendCappedAmountQuery()
  const { chain, ticker } = coin

  const keysignPayloadQuery = useSendTxKeysignPayloadQuery()

  const translatedTerms = sendTerms.map(term => t(term))

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('send_overview')}
        hasBorder
      />
      <VerifyKeysignStart
        keysignPayloadQuery={keysignPayloadQuery}
        terms={translatedTerms}
      >
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
            <RowTitle>{t('network')}</RowTitle>
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
      </VerifyKeysignStart>
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
