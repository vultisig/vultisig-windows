import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { DepositConfirmButton } from '@core/ui/vault/deposit/DepositConfirmButton'
import { getFormattedFormData } from '@core/ui/vault/deposit/DepositVerify/utils'
import { DepositFee } from '@core/ui/vault/deposit/fee/DepositFee'
import { useDepositMemo } from '@core/ui/vault/deposit/hooks/useDepositMemo'
import { useSender } from '@core/ui/vault/deposit/hooks/useSender'
import { ProgressLine } from '@lib/ui/flow/ProgressLine'
import { List } from '@lib/ui/list'
import { ListItem } from '@lib/ui/list/item'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useDepositFormConfig } from '../hooks/useDepositFormConfig'
import { useDepositAction } from '../providers/DepositActionProvider'
import { useDepositCoin } from '../providers/DepositCoinProvider'
import { useDepositData } from '../state/data'
import { BondOverview } from './BondOverview'
import { StakeOverview } from './StakeOverview'

export const DepositVerify = ({ onBack }: OnBackProp) => {
  const [selectedChainAction] = useDepositAction()
  const [coin] = useDepositCoin()
  const depositData = useDepositData()
  const [{ entryPoint }] = useCoreViewState<'deposit'>()

  const memo = useDepositMemo()

  const formattedDepositFormData = getFormattedFormData(
    { ...depositData, memo },
    selectedChainAction,
    coin
  )

  const sender = useSender()
  const { t } = useTranslation()
  const { fields: actionFields } = useDepositFormConfig()

  const shouldUseBondOverview =
    entryPoint === 'defi' && selectedChainAction === 'bond'
  const shouldUseStakeOverview =
    entryPoint === 'defi' &&
    (selectedChainAction === 'stake' || selectedChainAction === 'unstake')

  if (shouldUseBondOverview) {
    return <BondOverview onBack={onBack} />
  }

  if (shouldUseStakeOverview) {
    return <StakeOverview onBack={onBack} />
  }

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton onClick={onBack} />}
        title={t('verify')}
        hasBorder
      />
      <PageContent gap={16} scrollable>
        <ProgressLine value={0.3} />
        <List>
          <ListItem description={sender} title={t('from')} />
          {actionFields.map(field => {
            if (
              formattedDepositFormData[field.name] == null ||
              formattedDepositFormData[field.name] === '' ||
              field?.name === 'memo'
            ) {
              return null
            }

            return field.type === 'number' || field.type === 'percentage' ? (
              <ListItem
                description={`${String(formattedDepositFormData[field.name])}${field.name === 'amount' ? ` ${coin.ticker}` : ''}`}
                key={field.name}
                title={field.label}
              />
            ) : (
              <ListItem
                description={String(formattedDepositFormData[field.name])}
                key={field.name}
                title={field.label}
              />
            )
          })}
          {selectedChainAction === 'merge' && (
            <ListItem
              description={String(formattedDepositFormData.nodeAddress)}
              title={t('to')}
            />
          )}
          {selectedChainAction === 'leave' && (
            <ListItem description={`0 ${coin.ticker}`} title={t('amount')} />
          )}
          {Boolean(formattedDepositFormData['memo']) && (
            <ListItem
              description={String(formattedDepositFormData['memo'])}
              title={t('memo')}
            />
          )}
          <ListItem description={<DepositFee />} title={t('est_network_fee')} />
        </List>
      </PageContent>
      <PageFooter>
        <DepositConfirmButton />
      </PageFooter>
    </>
  )
}
