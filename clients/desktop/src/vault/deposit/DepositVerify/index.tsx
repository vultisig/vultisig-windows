import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { Text } from '@lib/ui/text'
import { FC } from 'react'
import { FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

import { TxOverviewPanel } from '../../../chain/tx/components/TxOverviewPanel'
import {
  TxOverviewColumn,
  TxOverviewRow,
  TxOverviewRowDepositsFlow,
} from '../../../chain/tx/components/TxOverviewRow'
import { WithProgressIndicator } from '../../keysign/shared/WithProgressIndicator'
import { useCurrentVaultCoin } from '../../state/currentVaultCoins'
import { ChainAction } from '../ChainAction'
import { DepositConfirmButton } from '../DepositConfirmButton'
import { getRequiredFieldsPerChainAction } from '../DepositForm/chainOptionsConfig'
import { DepositFee } from '../fee/DepositFee'
import { DepositFiatFee } from '../fee/DepositFiatFee'
import { useCurrentDepositCoin } from '../hooks/useCurrentDepositCoin'
import { useMemoGenerator } from '../hooks/useMemoGenerator'
import { useSender } from '../hooks/useSender'
import { StrictText, StrictTextContrast } from './DepositVerify.styled'
import { getFormattedFormData } from './utils'

type DepositVerifyProps = {
  depositFormData: FieldValues
  selectedChainAction: ChainAction
  onBack: () => void
  fee: bigint
}

export const DepositVerify: FC<DepositVerifyProps> = ({
  onBack,
  depositFormData,
  selectedChainAction,
  fee,
}) => {
  const depositFormDataWithMemo = useMemoGenerator({
    depositFormData: depositFormData,
    selectedChainAction: selectedChainAction,
    bondableAsset: depositFormData?.bondableAsset,
    fee,
  })

  const [coinKey] = useCurrentDepositCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const formattedDepositFormData = getFormattedFormData(
    depositFormDataWithMemo,
    selectedChainAction,
    coin
  )

  const sender = useSender()
  const { t } = useTranslation()
  const actionFields = selectedChainAction
    ? getRequiredFieldsPerChainAction(t)[selectedChainAction]?.fields
    : []

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewColumn key="from">
              <Text size={18} weight={700}>
                {t('from')}
              </Text>
              <StrictTextContrast>{sender}</StrictTextContrast>
            </TxOverviewColumn>
            {actionFields.map(field => {
              if (
                formattedDepositFormData[field.name] == null ||
                formattedDepositFormData[field.name] === ''
              ) {
                return null
              }

              return field.type === 'number' || field.type === 'percentage' ? (
                <TxOverviewRowDepositsFlow key={field.name}>
                  <Text size={18} weight={700}>
                    {field.label}
                  </Text>
                  <StrictText>
                    {String(formattedDepositFormData[field.name])}{' '}
                    {field.name === 'amount' && coin.ticker}
                  </StrictText>
                </TxOverviewRowDepositsFlow>
              ) : (
                <TxOverviewColumn key={field.name}>
                  <Text size={18} weight={700}>
                    {field.label}
                  </Text>
                  <StrictTextContrast>
                    {String(formattedDepositFormData[field.name])}
                  </StrictTextContrast>
                </TxOverviewColumn>
              )
            })}
            {selectedChainAction === 'leave' && (
              <TxOverviewRowDepositsFlow>
                <Text size={18} weight={700}>
                  {t('amount')}
                </Text>
                <StrictText>0 {coin.ticker}</StrictText>
              </TxOverviewRowDepositsFlow>
            )}
            <TxOverviewRow key="memo">
              <Text size={18} weight={700}>
                {t('memo')}
              </Text>
              <StrictTextContrast>
                {String(formattedDepositFormData['memo'])}
              </StrictTextContrast>
            </TxOverviewRow>
            <TxOverviewRow>
              <DepositFee />
            </TxOverviewRow>
            <TxOverviewRow>
              <DepositFiatFee />
            </TxOverviewRow>
          </TxOverviewPanel>
        </WithProgressIndicator>
        <DepositConfirmButton
          action={selectedChainAction}
          depositFormData={formattedDepositFormData}
        />
      </PageContent>
    </>
  )
}
