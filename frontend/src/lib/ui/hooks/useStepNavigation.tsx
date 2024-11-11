import { useCallback, useEffect, useState } from 'react';

type UseStepNavigationInput<T> = {
  steps: readonly T[];
  initialStep?: T;
  onExit?: () => void;
};

export function useStepNavigation<T>({
  steps,
  initialStep = steps[0],
  onExit,
}: UseStepNavigationInput<T>) {
  const [step, setStep] = useState<T>(initialStep);

  useEffect(() => {
    setStep(initialStep);
  }, [steps, initialStep]);

  const toNextStep = useCallback(() => {
    setStep(prev => steps[steps.indexOf(prev) + 1]);
  }, [steps]);

  const toPreviousStep = useCallback(() => {
    const currentStepIndex = steps.indexOf(step);
    if (currentStepIndex === 0) {
      onExit?.();
    } else {
      setStep(prev => steps[steps.indexOf(prev) - 1]);
    }
  }, [onExit, step, steps]);

  return { step, setStep, toNextStep, toPreviousStep };
}
