import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useCore } from '@core/ui/state/core'
import { BackupWarningMessage } from '@core/ui/vault/backup/BackupWarningMessage'
import { Button } from '@lib/ui/buttons/Button'
import { CloudDownloadIcon } from '@lib/ui/icons/CloudDownloadIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useRive } from '@rive-app/react-webgl2'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const backupLearnMoreUrl =
  'https://docs.vultisig.com/getting-started/getting-started/backup-recovery'

type BackupInCloudScreenProps = {
  onContinue: () => void
  onBack?: () => void
  ctaLoading?: boolean
}

export const BackupInCloudScreen = ({
  onContinue,
  onBack,
  ctaLoading = false,
}: BackupInCloudScreenProps) => {
  const { t } = useTranslation()
  const { openUrl } = useCore()
  const { RiveComponent } = useRive({
    src: '/core/animations/backup-vault-splash.riv',
    autoplay: true,
  })

  return (
    <VStack fullHeight>
      <PageHeader
        title={t('backupVault')}
        hasBorder
        primaryControls={
          onBack ? <PageHeaderBackButton onClick={onBack} /> : undefined
        }
      />
      <Container fullHeight>
        <AnimationWrapper>
          <AnimationContainer>
            <RiveComponent />
          </AnimationContainer>
        </AnimationWrapper>
        <ContentSection>
          <VStack gap={16}>
            <Text size={28} weight={500} centerHorizontally color="contrast">
              {t('backupInCloudTitle')}
            </Text>
            <Text size={14} centerHorizontally color="shy">
              {t('backupInCloudDescription')}
            </Text>
            <LearnMoreLink
              type="button"
              onClick={() => openUrl(backupLearnMoreUrl)}
            >
              <Text size={14} color="shyExtra">
                {t('learnMore')}
              </Text>
            </LearnMoreLink>
            <BackupWarningMessage />
          </VStack>
          <Button
            icon={<CloudDownloadIcon />}
            onClick={onContinue}
            loading={ctaLoading}
          >
            {t('backup_now')}
          </Button>
        </ContentSection>
      </Container>
    </VStack>
  )
}

const Container = styled(PageContent)`
  align-items: center;
`

const AnimationWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  width: 100%;
  overflow: hidden;
`

const AnimationContainer = styled.div`
  width: 100%;
  max-width: 500px;
  aspect-ratio: 500 / 350;
  position: relative;
  overflow: hidden;

  canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
`

const ContentSection = styled(VStack)`
  width: min(345px, 100%);
  padding: 0 24px 24px;
  flex-shrink: 0;
  gap: 32px;
`

const LearnMoreLink = styled.button`
  align-self: center;
  background: none;
  border: none;
  color: ${getColor('textShyExtra')};
  cursor: pointer;
  padding: 0;
  text-decoration: underline;

  &,
  & * {
    text-decoration: underline;
  }
`
