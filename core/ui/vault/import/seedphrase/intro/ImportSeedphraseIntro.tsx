import { Button } from '@lib/ui/buttons/Button'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { useRive } from '@rive-app/react-webgl2'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useImportSeedphraseStep } from '../state/step'
import { ImportSeedphraseIntroRequirements } from './ImportSeedphraseIntroRequirements'

const AnimationContainer = styled.div<{ showContent: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  width: 100%;
  flex-grow: ${({ showContent }) => (showContent ? 0 : 1)};
  padding-top: ${({ showContent }) => (showContent ? 32 : 0)}px;

  & > * {
    width: 80% !important;
    max-width: 280px !important;
    max-height: 240px !important;
    aspect-ratio: 263 / 186;
  }
`

const ContentArea = styled(VStack)`
  flex-grow: 1;
  width: 100%;
  max-width: 576px;
  align-self: center;
  padding-top: 32px;
`

export const ImportSeedphraseIntroStep = () => {
  const { t } = useTranslation()
  const [, setStep] = useImportSeedphraseStep()

  const [showContent, setShowContent] = useState(false)

  const { RiveComponent } = useRive({
    src: '/core/animations/import-seedphrase.riv',
    stateMachines: ['State Machine 1'],
    autoplay: true,
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <VStack flexGrow>
      <AnimationContainer showContent={showContent}>
        <RiveComponent />
      </AnimationContainer>

      <AnimatedVisibility
        isOpen={showContent}
        overlayStyles={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <ContentArea justifyContent="space-between" gap={40}>
          <ImportSeedphraseIntroRequirements />
          <Button onClick={() => setStep('input')}>{t('next')}</Button>
        </ContentArea>
      </AnimatedVisibility>
    </VStack>
  )
}
