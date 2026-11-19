import { useEffect, useState } from 'react'
import styled from 'styled-components'

import { KeysignProgress } from '../action/state/keysignAction'
import { useKeysignMessagePayload } from '../state/keysignMessagePayload'
import { KeysignLoadingAnimation } from './KeysignLoadingAnimation'
import { KeysignManyInputsNotice } from './KeysignManyInputsNotice'
import { getKeysignPayloadLogoSrc } from './utils/getKeysignPayloadLogoSrc'
import { getSignatureTrackedProgress } from './utils/getSignatureTrackedProgress'

// A single TSS signing operation exposes no per-round progress, so for a
// one-signature keysign the bar is driven by a simulated ramp that eases
// toward a ceiling. Once the signing loop reports more than one signature
// (multi-input UTXO sends), the ramp stops where it is and the rest of the bar
// is split evenly across the signatures, so it only fills when the last one
// is done. The component unmounts when the keysign mutation resolves,
// flipping the screen to the success state.
const signingProgressCeiling = 90
const signingDurationMs = 12000
const signingTickMs = 200

/**
 * Full-screen signing state shown while an MPC keysign is in progress.
 * Renders the Rive animation with the signing coin's logo (falling back to
 * the chain logo when no coin logo is available), plus a slow-signing notice
 * once the number of messages being signed is known.
 */
export const KeysignSigningState = ({
  isConnected = true,
  messageCount,
  signatureProgress,
}: {
  isConnected?: boolean
  messageCount?: number
  signatureProgress?: KeysignProgress
}) => {
  const payload = useKeysignMessagePayload()
  const logoSrc = getKeysignPayloadLogoSrc(payload)
  const [rampProgress, setRampProgress] = useState(0)
  const isTrackingSignatures =
    signatureProgress !== undefined && signatureProgress.total > 1

  useEffect(() => {
    if (!isConnected || isTrackingSignatures) return

    const start = Date.now()
    const interval = setInterval(() => {
      const ratio = Math.min((Date.now() - start) / signingDurationMs, 1)
      // Ease-out: advances quickly at first, then slows as it nears the ceiling
      setRampProgress(
        Math.round(signingProgressCeiling * (1 - (1 - ratio) ** 2))
      )
    }, signingTickMs)

    return () => clearInterval(interval)
  }, [isConnected, isTrackingSignatures])

  const progress = isTrackingSignatures
    ? getSignatureTrackedProgress({
        ...signatureProgress,
        startProgress: rampProgress,
      })
    : rampProgress

  return (
    <Container
      data-phase={isConnected ? 'signing' : 'connecting'}
      data-progress={progress}
      data-testid="keysign-progress"
    >
      <KeysignLoadingAnimation
        isConnected={isConnected}
        progress={progress}
        logoSrc={logoSrc}
      />
      {messageCount !== undefined && (
        <Notice>
          <KeysignManyInputsNotice value={messageCount} />
        </Notice>
      )}
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

const Notice = styled.div`
  position: absolute;
  inset-inline: 0;
  bottom: 24px;
  z-index: 1;
  padding-inline: 16px;
`
