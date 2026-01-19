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
}

export const KeygenLoadingAnimation = ({
  isConnected,
}: KeygenLoadingAnimationProps) => {
  const { RiveComponent, containerRef, setConnected } =
    useKeygenLoadingAnimation()

  useEffect(() => {
    setConnected(isConnected)
  }, [isConnected, setConnected])

  return (
    <AnimationContainer ref={containerRef}>
      <RiveComponent style={{ width: '100%', height: '100%' }} />
    </AnimationContainer>
  )
}
