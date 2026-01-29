import { useBackupDeviceAnimation } from '@core/ui/vault/backup/hooks/useBackupDeviceAnimation'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { Button } from '@lib/ui/buttons/Button'
import { ArrowSplitIcon } from '@lib/ui/icons/ArrowSplitIcon'
import { CloudUploadFilledIcon } from '@lib/ui/icons/CloudUploadFilledIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageContent } from '@lib/ui/page/PageContent'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { Trans, useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { BackupOverviewInfoRow } from './BackupOverviewInfoRow'

export const BackupOverviewScreen = ({ onFinish }: OnFinishProp) => {
  const { t } = useTranslation()
  const vault = useCurrentVault()

  const { RiveComponent, isLoading } = useBackupDeviceAnimation(vault.signers)

  return (
    <Container fullHeight>
      <AnimationContainer>
        <RiveComponent />
      </AnimationContainer>
      <ContentSection gap={32}>
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
            icon={<CloudUploadFilledIcon style={{ fontSize: 24 }} />}
            title={t('backupEachDevice')}
            description={t('backupEachDeviceDescription')}
          />
          <BackupOverviewInfoRow
            icon={<ArrowSplitIcon style={{ fontSize: 24 }} />}
            title={t('storeBackupsSeparately')}
            description={t('storeBackupsSeparatelyDescription')}
          />
        </VStack>
        <Button onClick={onFinish} loading={isLoading}>
          {t('continue')}
        </Button>
      </ContentSection>
    </Container>
  )
}

const Container = styled(PageContent)`
  align-items: center;
  justify-content: center;
  gap: 32px;
`

const AnimationContainer = styled.div`
  width: 350px;
  height: 240px;
  flex-shrink: 0;

  canvas {
    width: 100% !important;
    height: 100% !important;
    object-fit: contain;
  }
`

const ContentSection = styled(VStack)`
  width: min(345px, 100%);
  padding: 0 24px;
`
