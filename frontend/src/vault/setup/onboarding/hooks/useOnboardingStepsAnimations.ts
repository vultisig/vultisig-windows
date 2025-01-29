import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useCallback } from 'react';

import { useStepNavigation } from '../../../../lib/ui/hooks/useStepNavigation';

const STATE_MACHINE_NAME = 'State Machine 1';
const INPUT_NAME = 'Next';

export const ONBOARDING_ANIMATIONS = [
  'vaultSharesIntro',
  'vaultSharesInfo',
  'vaultDevice',
  'vaultRecovery',
  'vaultBackup',
  'vaultUnlock',
] as const;

export const useOnboardingStepsAnimations = () => {
  const { step: currentAnimation, toNextStep: toNextAnimation } =
    useStepNavigation({
      steps: ONBOARDING_ANIMATIONS,
    });

  const { RiveComponent, rive } = useRive({
    src: '/rive-animations/onboarding-screen.riv',
    autoplay: true,
    stateMachines: [STATE_MACHINE_NAME],
  });

  const stateMachineInput = useStateMachineInput(
    rive,
    STATE_MACHINE_NAME,
    INPUT_NAME
  );

  const handleNextAnimation = useCallback(() => {
    if (stateMachineInput) {
      stateMachineInput.fire();
      toNextAnimation();
    }
  }, [stateMachineInput, toNextAnimation]);

  return {
    animations: ONBOARDING_ANIMATIONS,
    animationComponent: RiveComponent,
    currentAnimation,
    handleNextAnimation,
    isLoading: !rive,
  };
};
