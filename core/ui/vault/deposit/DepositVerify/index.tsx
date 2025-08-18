import { Coin } from '@core/chain/coin/Coin'
import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import {
  TxOverviewColumn,
  TxOverviewRow,
  TxOverviewRowDepositsFlow,
} from '@core/ui/chain/tx/TxOverviewRow'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { ChainAction } from '@core/ui/vault/deposit/ChainAction'
import { DepositConfirmButton } from '@core/ui/vault/deposit/DepositConfirmButton'
import { getRequiredFieldsPerChainAction } from '@core/ui/vault/deposit/DepositForm/chainOptionsConfig'
import { StrictTextContrast } from '@core/ui/vault/deposit/DepositVerify/DepositVerify.styled'
import { getFormattedFormData } from '@core/ui/vault/deposit/DepositVerify/utils'
import { DepositFee } from '@core/ui/vault/deposit/fee/DepositFee'
import { DepositFiatFee } from '@core/ui/vault/deposit/fee/DepositFiatFee'
import { useMemoGenerator } from '@core/ui/vault/deposit/hooks/useMemoGenerator'
import { useSender } from '@core/ui/vault/deposit/hooks/useSender'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { StrictText, Text } from '@lib/ui/text'
import { MiddleTruncate } from '@lib/ui/truncate'
import { FC } from 'react'
import { FieldValues } from 'react-hook-form'
import { useTranslation } from 'react-i18next'

type DepositVerifyProps = {
  depositFormData: FieldValues
  selectedChainAction: ChainAction
  onBack: () => void
}

export const DepositVerify: FC<DepositVerifyProps> = ({
  onBack,
  depositFormData,
  selectedChainAction,
}) => {
  const [{ coin: coinKey }] = useCoreViewState<'deposit'>()
  const selectedCoin =
    depositFormData?.selectedCoin &&
    typeof depositFormData.selectedCoin === 'object'
      ? (depositFormData.selectedCoin as Coin)
      : undefined
  const currentCoin = useCurrentVaultCoin(coinKey)
  const coin = selectedCoin || currentCoin

  const depositFormDataWithMemo = useMemoGenerator({
    depositFormData: depositFormData,
    selectedChainAction: selectedChainAction,
    bondableAsset: depositFormData?.bondableAsset,
    chain: coin?.chain,
  })

  const formattedDepositFormData = getFormattedFormData(
    depositFormDataWithMemo,
    selectedChainAction,
    coin
  )

  const sender = useSender()
  const { t } = useTranslation()
  const actionFields = selectedChainAction
    ? getRequiredFieldsPerChainAction(t, coin.chain)[selectedChainAction]
        ?.fields
    : []

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('verify')}
        hasBorder
      />
      <PageContent gap={40}>
        <WithProgressIndicator value={0.3}>
          <TxOverviewPanel>
            <TxOverviewColumn key="from">
              <Text size={18} weight={700}>
                {t('from')}
              </Text>
              <StrictTextContrast as={MiddleTruncate} text={sender} />
            </TxOverviewColumn>
            {actionFields.map(field => {
              if (
                formattedDepositFormData[field.name] == null ||
                formattedDepositFormData[field.name] === '' ||
                field?.name === 'memo'
              ) {
                return null
              }

              return field.type === 'number' || field.type === 'percentage' ? (
                <TxOverviewRowDepositsFlow key={field.name}>
                  <Text size={18} weight={700}>
                    {field.label}
                  </Text>
                  <StrictText family="mono">
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
            {selectedChainAction === 'merge' && (
              <TxOverviewColumn>
                <Text size={18} weight={700}>
                  {t('to')}
                </Text>
                <StrictTextContrast
                  as={MiddleTruncate}
                  text={String(formattedDepositFormData.nodeAddress)}
                />
              </TxOverviewColumn>
            )}
            {selectedChainAction === 'leave' && (
              <TxOverviewRowDepositsFlow>
                <Text size={18} weight={700}>
                  {t('amount')}
                </Text>
                <StrictText family="mono">0 {coin.ticker}</StrictText>
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
