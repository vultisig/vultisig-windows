import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { JoinKeysignTxOverview } from '@core/ui/mpc/keysign/join/tx/JoinKeysignTxOverview'
import { Button } from '@lib/ui/buttons/Button'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const JoinKeysignVerifyStep = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('verify')}
        hasBorder
      />
      <PageContent>
        <WithProgressIndicator value={0.6}>
          <TxOverviewPanel>
            <JoinKeysignTxOverview />
          </TxOverviewPanel>
        </WithProgressIndicator>
        <Button onClick={onFinish}>{t('join_keysign')}</Button>
      </PageContent>
    </>
  )
}
