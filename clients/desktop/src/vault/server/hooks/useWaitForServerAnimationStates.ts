import { useRive, useStateMachineInput } from '@rive-app/react-canvas';
import { useEffect } from 'react';

const SUCCESS_SCREEN_PERSISTENCE_IN_MS = 2000;

type UseWaitForServerAnimationStatesProps = {
  onAnimationEnd?: () => void;
  state?: 'success' | 'pending';
};

export const useWaitForServerAnimationStates = ({
  onAnimationEnd,
  state = 'pending',
}: UseWaitForServerAnimationStatesProps) => {
  const { RiveComponent, rive } = useRive({
    src: '/rive-animations/fast-vault-keygen.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  const input = useStateMachineInput(rive, 'State Machine 1', 'Connected');

  useEffect(() => {
    if (rive && state === 'success') {
      input?.fire();

      const timeoutId = setTimeout(
        () => onAnimationEnd?.(),
        SUCCESS_SCREEN_PERSISTENCE_IN_MS
      );

      return () => clearTimeout(timeoutId);
    }
  }, [input, onAnimationEnd, rive, state]);

  return RiveComponent;
};
