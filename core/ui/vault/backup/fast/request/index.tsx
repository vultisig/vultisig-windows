import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { StepTransition } from '@lib/ui/base/StepTransition'
import { useTranslation } from 'react-i18next'

import { RequestFastVaultBackupForm } from './RequestFastVaultBackupForm'
import { RequestFastVaultBackupSuccess } from './RequestFastVaultBackupSuccess'

/** The Server Backup flow: the request form, then the sent screen. */
export const RequestFastVaultBackup = () => {
  const { t } = useTranslation()

  return (
    <>
      <SettingsPageHeader title={t('server_backup')} />
      <StepTransition
        from={({ onFinish }) => (
          <RequestFastVaultBackupForm onFinish={onFinish} />
        )}
        to={() => <RequestFastVaultBackupSuccess />}
      />
    </>
  )
}
