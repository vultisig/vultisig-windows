import styled from 'styled-components'

import { useKeysignMessagePayload } from '../state/keysignMessagePayload'
import { KeysignLoadingAnimation } from './KeysignLoadingAnimation'
import { getKeysignPayloadChainLogoSrc } from './utils/getKeysignPayloadChainLogoSrc'

/**
 * Full-screen signing state shown while an MPC keysign is in progress.
 * Renders the chain-aware Rive animation with chain icon.
 */
export const KeysignSigningState = () => {
  const payload = useKeysignMessagePayload()
  const chainLogoSrc = getKeysignPayloadChainLogoSrc(payload)

  return (
    <Container>
      <KeysignLoadingAnimation isConnected chainLogoSrc={chainLogoSrc} />
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
