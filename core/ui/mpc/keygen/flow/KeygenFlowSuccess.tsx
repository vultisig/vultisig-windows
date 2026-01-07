import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { PageContent } from '@lib/ui/page/PageContent'
import { mediaQuery } from '@lib/ui/responsive/mediaQuery'
import { GradientText, Text } from '@lib/ui/text'
import { useRive, useStateMachineInput } from '@rive-app/react-canvas'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useCoreNavigate } from '../../../navigation/hooks/useCoreNavigate'

const animationDuration = 6000
const stateMachineName = 'State Machine 1'

const setRiveInput = (
  input: ReturnType<typeof useStateMachineInput>,
  value: boolean | number
) => {
  if (input && typeof input.value === typeof value) {
    input.value = value
  }
}

export const KeygenFlowSuccess = () => {
  const { t } = useTranslation()

  const { RiveComponent, rive } = useRive({
    src: '/core/animations/keygen_animationdata_binding.riv',
    stateMachines: stateMachineName,
    autoplay: true,
  })

  const testInput = useStateMachineInput(rive, stateMachineName, 'Test')
  const numberInput = useStateMachineInput(rive, stateMachineName, 'Number 1')

  useEffect(() => {
    setRiveInput(testInput, true)
    setRiveInput(numberInput, 1)
  }, [testInput, numberInput])

  const navigate = useCoreNavigate()

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      navigate({ id: 'vault' })
    }, animationDuration)

    return () => clearTimeout(timeoutId)
  }, [navigate])

  return (
    <Wrapper>
      <VStack justifyContent="space-between" flexGrow gap={24}>
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
