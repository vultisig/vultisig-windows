import { VaultBackup } from '@clients/extension/src/components/onboarding/components/AnimationDescriptions/VaultBackup'
import { VaultDevice } from '@clients/extension/src/components/onboarding/components/AnimationDescriptions/VaultDevice'
import { VaultRecovery } from '@clients/extension/src/components/onboarding/components/AnimationDescriptions/VaultRecovery'
import { VaultSharesInfo } from '@clients/extension/src/components/onboarding/components/AnimationDescriptions/VaultSharesInfo'
import { VaultSharesIntro } from '@clients/extension/src/components/onboarding/components/AnimationDescriptions/VaultSharesIntro'
import { VaultUnlock } from '@clients/extension/src/components/onboarding/components/AnimationDescriptions/VaultUnlock'
import { ONBOARDING_ANIMATIONS } from '@clients/extension/src/components/onboarding/hooks/useOnboardingStepsAnimations'
import { VStack } from '@lib/ui/layout/Stack'
import { FC } from 'react'

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
}) => <VStack justifyContent="center">{ANIMATIONS_CONTENT[animation]()}</VStack>
