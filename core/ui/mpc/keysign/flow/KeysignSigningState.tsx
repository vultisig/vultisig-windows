import styled from 'styled-components'

import { useKeysignMessagePayload } from '../state/keysignMessagePayload'
import { KeysignLoadingAnimation } from './KeysignLoadingAnimation'
import { getKeysignPayloadLogoSrc } from './utils/getKeysignPayloadLogoSrc'

/**
 * Full-screen signing state shown while an MPC keysign is in progress.
 * Renders the Rive animation with the signing coin's logo (falling back to
 * the chain logo when no coin logo is available).
 */
export const KeysignSigningState = () => {
  const payload = useKeysignMessagePayload()
  const logoSrc = getKeysignPayloadLogoSrc(payload)

  return (
    <Container>
      <KeysignLoadingAnimation isConnected logoSrc={logoSrc} />
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
