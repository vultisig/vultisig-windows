import { VStack } from '@lib/ui/layout/Stack'
import { FC } from 'react'
import styled from 'styled-components'

import { ONBOARDING_ANIMATIONS } from '../hooks/useOnboardingStepsAnimations'
import { VaultBackup } from './VaultBackup'
import { VaultDevice } from './VaultDevice'
import { VaultRecovery } from './VaultRecovery'
import { VaultSharesInfo } from './VaultSharesInfo'
import { VaultSharesIntro } from './VaultSharesIntro'
import { VaultUnlock } from './VaultUnlock'

const Wrapper = styled(VStack)`
  height: 144px;
`

const ANIMATIONS_CONTENT = [
  () => <VaultSharesIntro />,
  () => <VaultSharesInfo />,
  () => <VaultDevice />,
  () => <VaultRecovery />,
  () => <VaultBackup />,
  () => <VaultUnlock />,
]

type AnimationDescriptionProps = {
  animation: (typeof ONBOARDING_ANIMATIONS)[number]
}
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => (
  <Wrapper justifyContent="center">{ANIMATIONS_CONTENT[animation]()}</Wrapper>
)
