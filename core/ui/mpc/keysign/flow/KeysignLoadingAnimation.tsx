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
  chainLogoSrc?: string
}

/**
 * Full-bleed Rive animation displayed during the MPC keysign flow.
 *
 * The `.riv` file defaults to the Connecting state (`Connected=false`).
 * When `isConnected` is true, the animation transitions to the Signing
 * state with progress tracking and chain logo display.
 */
export const KeysignLoadingAnimation = ({
  isConnected,
  progress = 0,
  chainLogoSrc,
}: KeysignLoadingAnimationProps) => {
  const { RiveComponent, containerRef, setConnected, setProgress } =
    useKeysignLoadingAnimation({ chainLogoSrc })

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
