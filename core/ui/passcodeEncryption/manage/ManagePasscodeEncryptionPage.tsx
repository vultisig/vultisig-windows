import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { ManagePasscode } from '@core/ui/passcodeEncryption/manage/ManagePasscode'
import { SetPasscode } from '@core/ui/passcodeEncryption/manage/SetPasscode'
import { useIsPasscodeRequired } from '@core/ui/passcodeEncryption/state/useIsPasscodeRequired'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { useTranslation } from 'react-i18next'

export const ManagePasscodeEncryptionPage = () => {
  const { t } = useTranslation()
  const hasPasscodeEnabled = useIsPasscodeRequired()

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('security')} />
      <PageContent alignItems="center" flexGrow scrollable>
        {hasPasscodeEnabled ? <ManagePasscode /> : <SetPasscode />}
      </PageContent>
    </VStack>
  )
}
