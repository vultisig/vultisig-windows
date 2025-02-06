import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useCallback } from 'react';

const STATE_MACHINE_NAME = 'State Machine 1';
const INPUT_NAME = 'Next';

export const BACKUP_VAULT_ANIMATIONS = [1, 2, 3] as const;
const CURRENT_RIVE_ANIMATION = 3 as const;

export const useBackupOverviewStepsAnimationsPartTwo = () => {
  const { RiveComponent, rive } = useRive({
    src: '/rive-animations/backup-screen-fast-vault-part-2.riv',
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
    }
  }, [stateMachineInput]);

  return {
    animations: BACKUP_VAULT_ANIMATIONS,
    animationComponent: RiveComponent,
    currentAnimation: CURRENT_RIVE_ANIMATION,
    handleNextAnimation,
    isLoading: !rive,
  };
};
