import { ChildrenProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-canvas'
import styled from 'styled-components'

import { sameDimensions } from '../../lib/ui/css/sameDimensions'
import { Text } from '../../lib/ui/text'
import { peerOption } from './option/PeerOptionContainer'

const Container = styled.div`
  ${peerOption};
`

const Animation = styled.div`
  flex-shrink: 0;
  ${sameDimensions(24)};
`

export const PeerPlaceholder = ({ children }: ChildrenProp) => {
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-secure-vault/waiting-on-device.riv',
    autoplay: true,
  })

  return (
    <Container>
      <Animation>
        <RiveComponent />
      </Animation>
      <Text color="contrast" size={14} weight="500">
        {children}
      </Text>
    </Container>
  )
}
