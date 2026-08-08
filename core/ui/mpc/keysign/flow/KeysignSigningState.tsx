import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { useKeysignMessagePayload } from '../state/keysignMessagePayload'
import { KeysignLoadingAnimation } from './KeysignLoadingAnimation'
import { getKeysignPayloadLogoSrc } from './utils/getKeysignPayloadLogoSrc'

// The core keysign is a single TSS signing operation that exposes no
// per-round progress, so the bar is driven by a simulated ramp that eases
// toward a ceiling while signing is in progress. The component unmounts when
// the keysign mutation resolves, flipping the screen to the success state.
const signingProgressCeiling = 90
const signingDurationMs = 12000
const signingTickMs = 200

/**
 * Full-screen signing state shown while an MPC keysign is in progress.
 * Renders the Rive animation with the signing coin's logo (falling back to
 * the chain logo when no coin logo is available).
 */
export const KeysignSigningState = () => {
  const payload = useKeysignMessagePayload()
  const logoSrc = getKeysignPayloadLogoSrc(payload)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const start = Date.now()
    const interval = setInterval(() => {
      const ratio = Math.min((Date.now() - start) / signingDurationMs, 1)
      // Ease-out: advances quickly at first, then slows as it nears the ceiling
      setProgress(Math.round(signingProgressCeiling * (1 - (1 - ratio) ** 2)))
    }, signingTickMs)

    return () => clearInterval(interval)
  }, [])

  return (
    <Container>
      <KeysignLoadingAnimation
        isConnected
        progress={progress}
        logoSrc={logoSrc}
      />
    </Container>
  )
}

const Container = styled.div`
  position: relative;
  flex-grow: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
`
