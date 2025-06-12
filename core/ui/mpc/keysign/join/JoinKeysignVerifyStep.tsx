import { JoinKeysignTxOverview } from '@core/ui/mpc/keysign/join/tx/JoinKeysignTxOverview'
import { Button } from '@lib/ui/buttons/Button'
import { WithProgressIndicator } from '@lib/ui/flow/WithProgressIndicator'
import { List } from '@lib/ui/list'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageFooter } from '@lib/ui/page/PageFooter'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
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
      <PageContent scrollable>
        <WithProgressIndicator value={0.6}>
          <List>
            <JoinKeysignTxOverview />
          </List>
        </WithProgressIndicator>
      </PageContent>
      <PageFooter>
        <Button onClick={onFinish}>{t('join_keysign')}</Button>
      </PageFooter>
    </>
  )
}
