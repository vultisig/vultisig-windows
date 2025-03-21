import { OnForwardProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-canvas'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { VStack } from '../../../lib/ui/layout/Stack'
import { Spinner } from '../../../lib/ui/loaders/Spinner'
import { GradientText, Text } from '../../../lib/ui/text'
import { PageContent } from '../../../ui/page/PageContent'

const SETUP_VAULT_SUCCESS_SCREEN_TIME_IN_MS = 2500
export const SetupVaultSuccessScreen = ({ onForward }: OnForwardProp) => {
  const { t } = useTranslation()
  const { RiveComponent } = useRive({
    src: '/assets/animations/vault-creation-success/vault_created.riv',
    autoplay: true,
  })

  useEffect(() => {
    const timeoutId = setTimeout(
      onForward,
      SETUP_VAULT_SUCCESS_SCREEN_TIME_IN_MS
    )

    return () => clearTimeout(timeoutId)
  }, [onForward])

  return (
    <Wrapper justifyContent="center" alignItems="center">
      <VStack flexGrow justifyContent="center" alignItems="center">
        <RiveWrapper>
          <RiveComponent />
        </RiveWrapper>
        <VStack alignItems="center" gap={16}>
          <Text centerHorizontally size={40}>
            {t('vaultCreated')}{' '}
            <GradientText as="span">{t('successfully')}</GradientText>
          </Text>
          <Spinner size="3em" />
        </VStack>
      </VStack>
    </Wrapper>
  )
}

const Wrapper = styled(PageContent)`
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
`

const RiveWrapper = styled.div`
  width: 600px;
  flex: 1;
`
