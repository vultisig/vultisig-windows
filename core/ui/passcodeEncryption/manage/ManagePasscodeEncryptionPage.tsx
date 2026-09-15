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
        {/* Centred content takes its intrinsic width, and the six passcode
            boxes come to 336px — past the 328px the popup gives the page,
            which turned into a horizontal scrollbar. Capping the column lets
            the boxes shrink to fit. */}
        <VStack maxWidth="100%">
          <AppLockSwitch />
        </VStack>
      </PageContent>
    </VStack>
  )
}
