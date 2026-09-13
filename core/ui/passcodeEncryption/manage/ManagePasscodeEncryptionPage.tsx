import { FlowPageHeader } from '@core/ui/flow/FlowPageHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { useTranslation } from 'react-i18next'

import { AppLockSwitch } from './AppLockSwitch'

export const ManagePasscodeEncryptionPage = () => {
  const { t } = useTranslation()

  return (
    <VStack fullHeight>
      <FlowPageHeader title={t('security')} />
      <PageContent alignItems="center" flexGrow scrollable>
        <AppLockSwitch />
      </PageContent>
    </VStack>
  )
}
