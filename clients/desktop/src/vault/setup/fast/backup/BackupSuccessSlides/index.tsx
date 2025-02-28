import { useRive } from '@rive-app/react-canvas'
import { FC, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { HStack, VStack } from '../../../../../lib/ui/layout/Stack'
import { Spinner } from '../../../../../lib/ui/loaders/Spinner'
import { GradientText, Text } from '../../../../../lib/ui/text'
import { PageContent } from '../../../../../ui/page/PageContent'

const BACKUP_SUCCESS_WAIT_TIME_IN_MS = 6000
type BackupSuccessSlideProps = {
  onCompleted: () => void
}

export const BackupSuccessSlide: FC<BackupSuccessSlideProps> = ({
  onCompleted,
}) => {
  const { t } = useTranslation()
  const { RiveComponent } = useRive({
    src: '/assets/animations/fast-vault-backup/fast-vault-backup-screen-part-3/fastvault-backup-succes.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  })

  useEffect(() => {
    const timeoutId = setTimeout(onCompleted, BACKUP_SUCCESS_WAIT_TIME_IN_MS)
    return () => clearTimeout(timeoutId)
  }, [onCompleted])

  return (
    <Wrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper justifyContent="center">
          <RiveComponent />
        </RiveWrapper>
        <VStack alignItems="center" gap={12}>
          <Text centerHorizontally size={32}>
            <GradientText size={32}>
              {t('fastVaultSetup.backup.wellDone')}
            </GradientText>{' '}
            {t('fastVaultSetup.backup.setNewStandard')}
          </Text>
          <Spinner size="3em" />
        </VStack>
      </VStack>
    </Wrapper>
  )
}

const RiveWrapper = styled(HStack)`
  position: relative;
  flex: 1;
`

const Wrapper = styled(PageContent)`
  margin-top: 48px;
  margin-inline: auto;
  max-width: 800px;
`
