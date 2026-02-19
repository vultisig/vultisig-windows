import {
  dotsIndicatorAnimationSource,
  getOnboardingMpcAnimationPath,
  searchingDeviceAnimationSource,
} from '@core/ui/mpc/animations/onboardingMpcAnimationSources'
import { Animation } from '@lib/ui/animations/Animation'
import { VStack } from '@lib/ui/layout/Stack'
import styled from 'styled-components'

const SearchingDeviceAnimationContainer = styled.div`
  width: 120px;
  height: 120px;
`

const DotsIndicatorAnimationContainer = styled.div`
  width: 60px;
  height: 12px;
`

export const OnboardingPendingAnimation = () => {
  return (
    <VStack alignItems="center" gap={8}>
      <SearchingDeviceAnimationContainer>
        <Animation
          src={getOnboardingMpcAnimationPath(searchingDeviceAnimationSource)}
        />
      </SearchingDeviceAnimationContainer>
      <DotsIndicatorAnimationContainer>
        <Animation
          src={getOnboardingMpcAnimationPath(dotsIndicatorAnimationSource)}
        />
      </DotsIndicatorAnimationContainer>
    </VStack>
  )
}
