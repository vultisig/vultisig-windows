import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { Alignment, Fit, Layout, useRive } from '@rive-app/react-canvas'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

const animationDuration = 6000

export const KeygenFlowSuccess = () => {
  const { t } = useTranslation()

  const { RiveComponent, rive } = useRive({
    src: '/core/animations/keygen_animationdata_binding.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
    layout: new Layout({
      fit: Fit.Contain,
      alignment: Alignment.Center,
    }),
  })

  const navigate = useCoreNavigate()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate({ id: 'vault' })
    }, animationDuration)

    return () => clearTimeout(timeoutId)
  }, [navigate])

  useEffect(() => {
    if (!rive) return

    rive.resizeDrawingSurfaceToCanvas()

    const onResize = () => {
      rive.resizeDrawingSurfaceToCanvas()
    }

    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [rive])

  return (
    <Wrapper>
      <VStack justifyContent="space-between" flexGrow>
        <RiveWrapper justifyContent="center">
          <RiveComponent
            style={{
              flex: 1,
            }}
          />
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

const RiveWrapper = styled(VStack)`
  position: relative;
  flex: 1;
`

const Wrapper = styled(PageContent)`
  margin-inline: auto;
  max-width: 800px;

  @media (${mediaQuery.tabletDeviceAndUp}) {
    margin-top: 48px;
  }
`
