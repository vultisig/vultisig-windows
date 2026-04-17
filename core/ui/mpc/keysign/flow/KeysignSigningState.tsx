import styled from 'styled-components'

import { useKeysignMessagePayload } from '../state/keysignMessagePayload'
import { KeysignLoadingAnimation } from './KeysignLoadingAnimation'
import { getKeysignPayloadLogoSrc } from './utils/getKeysignPayloadLogoSrc'

/**
 * Full-screen signing state shown while an MPC keysign is in progress.
 * Renders the coin-aware Rive animation with coin/token logo.
 */
export const KeysignSigningState = () => {
  const payload = useKeysignMessagePayload()
  const coinLogoSrc = getKeysignPayloadLogoSrc(payload)

  return (
    <Container>
      <KeysignLoadingAnimation isConnected coinLogoSrc={coinLogoSrc} />
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
