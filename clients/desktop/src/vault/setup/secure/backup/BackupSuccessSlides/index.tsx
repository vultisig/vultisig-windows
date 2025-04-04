import { HStack, VStack } from '@lib/ui/layout/Stack'
import { OnFinishProp } from '@lib/ui/props'
import { GradientText, Text } from '@lib/ui/text'
import { useRive } from '@rive-app/react-canvas'
import { FC } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { Spinner } from '../../../../../lib/ui/loaders/Spinner'
import { PageContent } from '../../../../../ui/page/PageContent'

const BACKUP_SUCCESS_WAIT_TIME_IN_MS = 6000

export const BackupSuccessSlide: FC<OnFinishProp> = ({ onFinish }) => {
  const { t } = useTranslation()
  const { RiveComponent } = useRive({
    src: '/assets/animations/secure-vault-backup/secure-vault-backup-screen-part-3/index.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
    onStateChange: () => setTimeout(onFinish, BACKUP_SUCCESS_WAIT_TIME_IN_MS),
  })

  return (
    <Wrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper justifyContent="center">
          <RiveComponent />
        </RiveWrapper>
        <VStack alignItems="center" gap={12}>
          <Text centerHorizontally size={32}>
            <GradientText>{t('fastVaultSetup.backup.wellDone')}</GradientText>{' '}
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
