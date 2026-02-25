import { PageHeaderBackButton } from '@core/ui/flow/PageHeaderBackButton'
import { useBackupDeviceAnimation } from '@core/ui/vault/backup/hooks/useBackupDeviceAnimation'
import { Button } from '@lib/ui/buttons/Button'
import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CloudUploadIcon } from '@lib/ui/icons/CloudUploadIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { OnBackProp, OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BackupOverviewInfoRow } from './BackupOverviewInfoRow'

type BackupOverviewScreenProps = OnFinishProp &
  Partial<OnBackProp> & {
    userDeviceCount: number
  }

export const BackupOverviewScreen = ({
  userDeviceCount,
  onFinish,
  onBack,
}: BackupOverviewScreenProps) => {
  const { t } = useTranslation()

  const { RiveComponent, isLoading } = useBackupDeviceAnimation(userDeviceCount)

  return (
    <Container fullHeight>
      {onBack && (
        <PageHeader
          primaryControls={<PageHeaderBackButton onClick={onBack} />}
        />
      )}
      <AnimationWrapper>
        <AnimationContainer>
          <RiveComponent />
        </AnimationContainer>
      </AnimationWrapper>
      <ContentSection>
        <VStack gap={16}>
          <Text size={22} weight={500} color="contrast">
            <Trans
              i18nKey="backupsTitle"
              components={{
                highlight: <GradientText as="span" />,
              }}
            />
          </Text>
          <Text size={13} color="shy">
            {t('backupsDescription')}
          </Text>
        </VStack>
        <VStack gap={16}>
          <BackupOverviewInfoRow
            icon={<CloudUploadIcon style={{ fontSize: 24 }} />}
            title={t('backupEachDevice')}
            description={
              <Trans
                i18nKey="backupEachDeviceDescription"
                components={{
                  w: <Text as="span" color="contrast" />,
                }}
              />
            }
          />
          <BackupOverviewInfoRow
            icon={<ArrowSplitIcon style={{ fontSize: 24 }} />}
            title={t('storeBackupsSeparately')}
            description={t('storeBackupsSeparatelyDescription')}
          />
        </VStack>
        <Button onClick={onFinish} loading={isLoading}>
          {t('i_understand')}
        </Button>
      </ContentSection>
    </Container>
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
