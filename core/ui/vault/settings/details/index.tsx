import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { SettingsPageContent } from '@core/ui/settings/SettingsPageContent'
import { SettingsPageHeader } from '@core/ui/settings/SettingsPageHeader'
import { VaultDetailsContent } from '@core/ui/vault/settings/details/VaultDetailsContent'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const ScreenshotWrapper = styled.div`
  ${vStack({ gap: 24 })}
  background: ${getColor('background')};
  padding: 24px;
`

/** Shows the current vault's details and saves them as an image. */
export const VaultDetailsPage = () => {
  const { t } = useTranslation()
  const { name } = useCurrentVault()

  return (
    <VStack fullHeight>
      <SettingsPageHeader
        title={t('details')}
        secondaryControls={
          <SaveAsImage
            fileName={`${name}-vault-details`}
            renderTrigger={({ onClick }) => (
              <IconButton onClick={onClick}>
                <ShareIcon />
              </IconButton>
            )}
            value={
              <ScreenshotWrapper>
                <VaultDetailsContent />
              </ScreenshotWrapper>
            }
          />
        }
      />
      <SettingsPageContent gap={24} flexGrow scrollable>
        <VaultDetailsContent />
      </SettingsPageContent>
    </VStack>
  )
}
