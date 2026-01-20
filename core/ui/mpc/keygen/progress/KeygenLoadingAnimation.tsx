import { useEffect } from 'react'
import styled from 'styled-components'

import { useKeygenLoadingAnimation } from './hooks/useKeygenLoadingAnimation'

const AnimationContainer = styled.div`
  position: absolute;
  inset: 0;
  z-index: 0;
  overflow: hidden;
`

type KeygenLoadingAnimationProps = {
  isConnected: boolean
  progress?: number
}

export const KeygenLoadingAnimation = ({
  isConnected,
  progress = 0,
}: KeygenLoadingAnimationProps) => {
  const { RiveComponent, containerRef, setConnected, setProgress } =
    useKeygenLoadingAnimation()

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
