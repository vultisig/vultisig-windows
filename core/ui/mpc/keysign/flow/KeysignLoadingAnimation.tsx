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
 * @param isConnected - Whether the relay/peer connection is established;
 *   forwarded to the Rive `Connected` ViewModel input.
 * @param progress - Optional signing progress percentage (0–100); forwarded to
 *   the Rive `progessPercentage` ViewModel input. Defaults to 0.
 * @param chainLogoSrc - Optional chain logo URL to display inside the
 *   Rive animation via the `fromLogo` ViewModel image input.
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
