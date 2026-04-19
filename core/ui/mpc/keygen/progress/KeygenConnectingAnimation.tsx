import styled from 'styled-components'

import { KeygenLoadingAnimation } from './KeygenLoadingAnimation'

const Container = styled.div`
  position: relative;
  flex-grow: 1;
  width: 100%;
  min-height: 0;
  overflow: hidden;
`

/**
 * Full-screen Rive animation in the Connecting state (`isConnected=false`).
 * Uses the keygen animation which includes a dedicated Connecting visual.
 */
export const KeygenConnectingAnimation = () => (
  <Container>
    <KeygenLoadingAnimation isConnected={false} />
  </Container>
)
