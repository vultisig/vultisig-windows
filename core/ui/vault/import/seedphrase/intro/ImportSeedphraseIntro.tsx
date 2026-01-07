import { Button } from '@lib/ui/buttons/Button'
import { AnimatedVisibility } from '@lib/ui/layout/AnimatedVisibility'
import { VStack } from '@lib/ui/layout/Stack'
import { useRive } from '@rive-app/react-canvas'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled, { css } from 'styled-components'

import { useImportSeedphraseStep } from '../state/step'
import { ImportSeedphraseIntroRequirements } from './ImportSeedphraseIntroRequirements'

const animationTop = 32
const animationHeight = 186
const animationWidth = 263
const animationGap = 32

const AnimationContainer = styled.div<{ showContent: boolean }>`
  position: absolute;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;
  z-index: 1;

  ${({ showContent }) =>
    showContent
      ? css`
          top: ${animationTop}px;
        `
      : css`
          top: 50%;
          transform: translateY(-50%);
        `}

  & > * {
    width: ${animationWidth}px !important;
    height: ${animationHeight}px !important;
  }
`

const ContentArea = styled(VStack)`
  flex-grow: 1;
  padding-top: ${animationTop + animationHeight + animationGap}px;
  width: 100%;
  max-width: 576px;
  align-self: center;
`

export const ImportSeedphraseIntroStep = () => {
  const { t } = useTranslation()
  const [, setStep] = useImportSeedphraseStep()

  const [showContent, setShowContent] = useState(false)

  const { RiveComponent } = useRive({
    src: '/core/animations/import-seedphrase.riv',
    autoplay: true,
  })

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [])

  return (
    <VStack style={{ position: 'relative' }} flexGrow>
      <AnimationContainer showContent={showContent}>
        <RiveComponent />
      </AnimationContainer>

      <ContentArea>
        <AnimatedVisibility
          isOpen={showContent}
          overlayStyles={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <VStack flexGrow justifyContent="space-between" gap={40}>
            <ImportSeedphraseIntroRequirements />

            <Button onClick={() => setStep('input')}>{t('next')}</Button>
          </VStack>
        </AnimatedVisibility>
      </ContentArea>
    </VStack>
  )
}
