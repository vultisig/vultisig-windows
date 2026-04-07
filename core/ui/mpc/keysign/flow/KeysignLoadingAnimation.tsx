import { useEffect } from 'react'
import styled from 'styled-components'

import { useKeysignLoadingAnimation } from './hooks/useKeysignLoadingAnimation'

const AnimationContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
`

type KeysignLoadingAnimationProps = {
  isConnected: boolean
  progress?: number
}

export const KeysignLoadingAnimation = ({
  isConnected,
  progress = 0,
}: KeysignLoadingAnimationProps) => {
  const { RiveComponent, containerRef, setConnected, setProgress } =
    useKeysignLoadingAnimation()

  useEffect(() => {
    setConnected(isConnected)
  }, [isConnected, setConnected])

  useEffect(() => {
    setProgress(progress)
  }, [progress, setProgress])

  return (
    <AnimationContainer ref={containerRef}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </AnimationContainer>
  )
}
