import { peerOption } from '@core/ui/mpc/devices/peers/option/PeerOptionContainer'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import { useRive } from '@rive-app/react-canvas'
import styled from 'styled-components'

const Container = styled.div`
  ${peerOption};
`

const Animation = styled.div`
  flex-shrink: 0;
  ${sameDimensions(24)};
`

export const PeerPlaceholder = ({ children }: ChildrenProp) => {
  const { RiveComponent } = useRive({
    src: '/core/animations/waiting-on-device.riv',
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
