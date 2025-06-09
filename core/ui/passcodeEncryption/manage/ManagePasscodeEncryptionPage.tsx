import { ManagePasscode } from '@core/ui/passcodeEncryption/manage/ManagePasscode'
import { SetPasscode } from '@core/ui/passcodeEncryption/manage/SetPasscode'
import { useHasPasscodeEncryption } from '@core/ui/storage/passcodeEncryption'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderBackButton } from '@lib/ui/page/PageHeaderBackButton'
import { PageHeaderTitle } from '@lib/ui/page/PageHeaderTitle'
import { useTranslation } from 'react-i18next'

export const ManagePasscodeEncryptionPage = () => {
  const { t } = useTranslation()
  const hasPasscodeEnabled = useHasPasscodeEncryption()

  return (
    <VStack fullHeight>
      <PageHeader
        title={<PageHeaderTitle>{t('security')}</PageHeaderTitle>}
        primaryControls={<PageHeaderBackButton />}
        hasBorder
      />
      <PageContent alignItems="center" flexGrow scrollable>
        {hasPasscodeEnabled ? <ManagePasscode /> : <SetPasscode />}
      </PageContent>
    </VStack>
  )
}
