import { SettingsBaselineText } from '@core/ui/settings/SettingsBaselineText'
import { SettingsCtaButton } from '@core/ui/settings/SettingsCtaButton'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { useCore } from '@core/ui/state/core'
import { Image } from '@lib/ui/image/Image'
import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const Content = styled(SettingsPageContent)`
  padding-bottom: 24px;
`

const Description = styled(SettingsBaselineText)`
  max-width: 275px;
`

const CloseButton = styled(SettingsCtaButton)`
  font-weight: 600;
  width: 100%;
`

/** Confirms the backup share was sent, with a way back home. */
export const RequestFastVaultBackupSuccess = () => {
  const { t } = useTranslation()

  const { goHome } = useCore()

  return (
    <Content justifyContent="space-between" alignItems="center">
      <VStack alignItems="center" gap={50}>
        <Image src="/core/images/check-inbox.png" alt="" height={250} />
        <VStack alignItems="center" gap={16}>
          <Text centerHorizontally color="contrast" variant="stationTitle1">
            {t('backup_share_sent')}
          </Text>
          <Description
            centerHorizontally
            color="shy"
            height={20 / 14}
            size={14}
            weight={500}
          >
            {t('backup_share_sent_description')}
          </Description>
        </VStack>
      </VStack>
      <CloseButton kind="secondary" onClick={goHome}>
        {t('close')}
      </CloseButton>
    </Content>
  )
}
