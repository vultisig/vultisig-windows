import { Button } from '@lib/ui/buttons/Button'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { OnFinishProp } from '@lib/ui/props'
import { useTranslation } from 'react-i18next'

import { TxOverviewPanel } from '../../../../chain/tx/components/TxOverviewPanel'
import { WithProgressIndicator } from '../../shared/WithProgressIndicator'
import { KeysignTxOverview } from './KeysignTxOverview'

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
            <KeysignTxOverview />
          </TxOverviewPanel>
        </WithProgressIndicator>
        <Button onClick={onFinish}>{t('join_keysign')}</Button>
      </PageContent>
    </>
  )
}
