import { VaultSecurityType } from '@core/ui/vault/VaultSecurityType'
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
  securityType?: VaultSecurityType
}

/** Drives the keygen Rive canvas with connection and progress inputs. */
export const KeygenLoadingAnimation = ({
  isConnected,
  progress = 0,
  securityType,
}: KeygenLoadingAnimationProps) => {
  const { RiveComponent, containerRef, setConnected, setProgress } =
    useKeygenLoadingAnimation(securityType)

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
