import { FlowPageHeader } from '@lib/ui/flow/FlowPageHeader'
import { FitPageContent } from '@lib/ui/page/PageContent'
import { useTranslation } from 'react-i18next'

import { useHasPasscodeEncryption } from '../../storage/passcodeEncryption'
import { ManagePasscode } from './ManagePasscode'
import { SetPasscode } from './SetPasscode'

export const ManagePasscodeEncryptionPage = () => {
  const { t } = useTranslation()
  const hasPasscodeEnabled = useHasPasscodeEncryption()

  return (
    <>
      <FlowPageHeader title={t('security')} />
      <FitPageContent contentMaxWidth={360}>
        {hasPasscodeEnabled ? <ManagePasscode /> : <SetPasscode />}
      </FitPageContent>
    </>
  )
}
