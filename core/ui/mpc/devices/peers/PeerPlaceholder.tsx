import {
  getOnboardingMpcAnimationPath,
  searchingDeviceAnimationSource,
} from '@core/ui/mpc/animations/onboardingMpcAnimationSources'
import { peerOption } from '@core/ui/mpc/devices/peers/option/PeerOptionContainer'
import { Animation as RivAnimation } from '@lib/ui/animations/Animation'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChildrenProp } from '@lib/ui/props'
import { Text } from '@lib/ui/text'
import styled from 'styled-components'

const Container = styled.div`
  ${peerOption};
`

const AnimationContainer = styled.div`
  flex-shrink: 0;
  ${sameDimensions(24)};
`

export const PeerPlaceholder = ({ children }: ChildrenProp) => {
  return (
    <Container>
      <AnimationContainer>
        <RivAnimation
          src={getOnboardingMpcAnimationPath(searchingDeviceAnimationSource)}
        />
      </AnimationContainer>
      <Text color="contrast" size={14} weight="500">
        {children}
      </Text>
    </Container>
  )
}
