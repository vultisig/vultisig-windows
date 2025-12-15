import { SaveAsImage } from '@core/ui/file/SaveAsImage'
import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { VaultDetailsContent } from '@core/ui/vault/settings/details/VaultDetailsContent'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { ShareIcon } from '@lib/ui/icons/ShareIcon'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const ScreenshotWrapper = styled.div`
  ${vStack({ gap: 24 })}
  background: ${getColor('background')};
  padding: 24px;
`

export const VaultDetailsPage = () => {
  const { t } = useTranslation()
  const { name } = useCurrentVault()

  return (
    <VStack fullHeight>
      <PageHeader
        primaryControls={<PageHeaderBackButton />}
        title={t('details')}
        hasBorder
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
      <PageContent gap={24} flexGrow scrollable>
        <VaultDetailsContent />
      </PageContent>
    </VStack>
  )
}
