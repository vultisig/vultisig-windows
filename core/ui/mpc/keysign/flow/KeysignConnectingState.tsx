import styled from 'styled-components'

import { KeysignLoadingAnimation } from './KeysignLoadingAnimation'

/**
 * Full-screen connecting state shown while the MPC session is being
 * established before keysign. Renders the Rive animation in its
 * "Connecting" state (`isConnected=false`).
 */
export const KeysignConnectingState = () => (
  <Container>
    <KeysignLoadingAnimation isConnected={false} />
  </Container>
)

const Container = styled.div`
  position: relative;
  flex-grow: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
`
