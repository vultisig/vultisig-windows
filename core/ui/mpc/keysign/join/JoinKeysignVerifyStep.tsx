import { TxOverviewPanel } from '@core/ui/chain/tx/TxOverviewPanel'
import { JoinKeysignTxOverview } from '@core/ui/mpc/keysign/join/tx/JoinKeysignTxOverview'
import { Button } from '@lib/ui/buttons/Button'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

export const JoinKeysignVerifyStep = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={<PageHeaderTitle>{t('verify')}</PageHeaderTitle>}
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
