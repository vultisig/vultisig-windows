import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { animated, useSpring } from '@react-spring/web'
import { useRive } from '@rive-app/react-webgl2'
import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

import { useImportSeedphraseStep } from '../state/step'
import { ImportSeedphraseIntroRequirements } from './ImportSeedphraseIntroRequirements'

const OuterContainer = styled.div`
  flex-grow: 1;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;
`

const AnimationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  pointer-events: none;
  width: 100%;

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

const springConfig = { tension: 120, friction: 20 }

export const ImportSeedphraseIntroStep = () => {
  const { t } = useTranslation()
  const [, setStep] = useImportSeedphraseStep()

  const [showContent, setShowContent] = useState(false)
  const [offset, setOffset] = useState<number | null>(null)

  const outerRef = useRef<HTMLDivElement>(null)
  const riveRef = useRef<HTMLDivElement>(null)

  const { RiveComponent } = useRive({
    src: '/core/animations/import-seedphrase.riv',
    stateMachines: ['State Machine 1'],
    autoplay: true,
  })

  useLayoutEffect(() => {
    if (outerRef.current && riveRef.current) {
      const containerH = outerRef.current.clientHeight
      const riveH = riveRef.current.clientHeight
      setOffset(Math.max(0, (containerH - riveH) / 2))
    }
  }, [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setShowContent(true)
    }, 3000)

    return () => clearTimeout(timeoutId)
  }, [])

  const slideSpring = useSpring({
    transform: showContent ? 'translateY(0px)' : `translateY(${offset ?? 0}px)`,
    immediate: !showContent,
    config: springConfig,
  })

  const contentSpring = useSpring({
    opacity: showContent ? 1 : 0,
    delay: showContent ? 700 : 0,
    config: springConfig,
  })

  return (
    <OuterContainer ref={outerRef}>
      <animated.div
        style={{
          ...slideSpring,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%',
        }}
      >
        <AnimationContainer ref={riveRef}>
          <RiveComponent />
        </AnimationContainer>

        <animated.div
          style={{
            ...contentSpring,
            pointerEvents: showContent ? 'auto' : 'none',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
          }}
        >
          <ContentArea justifyContent="space-between" gap={40}>
            <ImportSeedphraseIntroRequirements />
            <Button onClick={() => setStep('input')}>{t('next')}</Button>
          </ContentArea>
        </animated.div>
      </animated.div>
    </OuterContainer>
  )
}
