import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { backupSplashAnimationSource } from '@core/ui/vault/backup/getBackupAnimationSource'
import { Button } from '@lib/ui/buttons/Button'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { Checkbox } from '@lib/ui/inputs/checkbox/Checkbox'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { Text } from '@lib/ui/text'
import { useRive } from '@rive-app/react-webgl2'
import { ReactNode, useState } from 'react'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

type SaveBackupToCloudScreenProps = {
  onContinue: () => void
  onBack?: () => void
  ctaLoading?: boolean
  title?: string
  description?: ReactNode
}

export const SaveBackupToCloudScreen = ({
  onContinue,
  onBack,
  ctaLoading = false,
  title,
  description,
}: SaveBackupToCloudScreenProps) => {
  const { t } = useTranslation()
  const [isAgreed, setIsAgreed] = useState(false)
  const { RiveComponent } = useRive({
    src: `/core/animations/${backupSplashAnimationSource}.riv`,
    autoplay: true,
  })

  return (
    <Container>
      <PageHeader
        primaryControls={
          onBack ? <PageHeaderBackButton onClick={onBack} /> : undefined
        }
      />
      <AnimationWrapper>
        <AnimationContainer>
          <RiveComponent />
        </AnimationContainer>
      </AnimationWrapper>
      <ContentSection>
        <VStack gap={32} alignItems="center">
          <IconWrapper>
            <CloudUploadIcon style={{ fontSize: 20 }} />
          </IconWrapper>
          <VStack gap={12} alignItems="center">
            <Text size={22} weight={500} color="contrast" centerHorizontally>
              {title ?? t('save_backup_to_cloud')}
            </Text>
            {description ?? (
              <Text size={14} weight={500} color="shy" centerHorizontally>
                <Trans
                  i18nKey="save_backup_description"
                  components={{
                    b: (
                      <Text as="span" size={14} color="contrast" weight={700} />
                    ),
                  }}
                />{' '}
                <Text as="span" color="shyExtra">
                  {t('save_backup_description_2')}
                </Text>
              </Text>
            )}
          </VStack>
        </VStack>
        <VStack gap={20}>
          <Checkbox
            value={isAgreed}
            onChange={() => setIsAgreed(prev => !prev)}
            label={
              <Text size={13} weight={500} color="contrast">
                {t('i_understand_save_backup')}
              </Text>
            }
          />
          <Button
            onClick={onContinue}
            disabled={!isAgreed || ctaLoading}
            loading={ctaLoading}
          >
            {t('save_backup')}
          </Button>
        </VStack>
      </ContentSection>
    </Container>
  )
}

const IconWrapper = styled.div`
  position: relative;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: #03132c;
  border: 1.5px solid rgba(255, 255, 255, 0.15);
  box-shadow: 0 2.051px 2.051px 0 rgba(0, 0, 0, 0.25) inset;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #2460ff;
  overflow: hidden;

  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 24px;
    height: 8px;
    background: #0c4eff;
    border-radius: 50%;
    pointer-events: none;
    filter: blur(8px);
    opacity: 0.6;
  }
`

const Container = styled(VStack)`
  height: 100%;
  overflow-y: auto;
`

const AnimationWrapper = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
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
  align-self: center;
  padding: 0 24px 24px;
  flex-shrink: 0;
  gap: 30px;
`
