import { VStack } from '@lib/ui/layout/Stack'
import { FC } from 'react'

import { onboardingAnimations } from '../../hooks/useOnboardingStepsAnimations'
import { VaultBackup } from './VaultBackup'
import { VaultDevice } from './VaultDevice'
import { VaultRecovery } from './VaultRecovery'
import { VaultSharesInfo } from './VaultSharesInfo'
import { VaultSharesIntro } from './VaultSharesIntro'
import { VaultUnlock } from './VaultUnlock'

const animationsContent = [
  () => <VaultSharesIntro />,
  () => <VaultSharesInfo />,
  () => <VaultDevice />,
  () => <VaultRecovery />,
  () => <VaultBackup />,
  () => <VaultUnlock />,
]

type AnimationDescriptionProps = {
  animation: (typeof onboardingAnimations)[number]
}
export const AnimationDescription: FC<AnimationDescriptionProps> = ({
  animation,
}) => <VStack justifyContent="center">{animationsContent[animation]()}</VStack>
