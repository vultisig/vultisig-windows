import { StepTransition } from '@lib/ui/base/StepTransition'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { useTranslation } from 'react-i18next'

import { PageHeaderBackButton } from '../../../../flow/PageHeaderBackButton'
import { RequestFastVaultBackupForm } from './RequestFastVaultBackupForm'
import { RequestFastVaultBackupSuccess } from './RequestFastVaultBackupSuccess'

export const RequestFastVaultBackup = () => {
  const { t } = useTranslation()

  return (
    <>
      <PageHeader
        title={t('server_backup')}
        primaryControls={<PageHeaderBackButton />}
      />
      <FitPageContent contentMaxWidth={468}>
        <StepTransition
          from={({ onFinish }) => (
            <RequestFastVaultBackupForm onFinish={onFinish} />
          )}
          to={() => <RequestFastVaultBackupSuccess />}
        />
      </FitPageContent>
    </>
  )
}
