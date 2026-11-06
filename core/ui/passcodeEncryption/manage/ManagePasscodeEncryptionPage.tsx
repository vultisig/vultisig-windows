import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { VStack } from '@lib/ui/layout/Stack'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { AppLockSwitch } from './AppLockSwitch'

// Holds the Set Passcode glow, and keeps its button 24 above the window edge.
const Page = styled(VStack)`
  position: relative;
`

const Content = styled(SettingsPageContent)`
  padding-bottom: 24px;
`

/** The Security page: the App Lock card and, while setting one, the passcode form. */
export const ManagePasscodeEncryptionPage = () => {
  const { t } = useTranslation()

  return (
    <Page fullHeight>
      <SettingsPageHeader title={t('security')} />
      <Content flexGrow scrollable>
        <AppLockSwitch />
      </Content>
    </Page>
  )
}
