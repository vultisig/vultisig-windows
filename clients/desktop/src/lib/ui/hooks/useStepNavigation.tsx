import { useCallback, useEffect, useState } from 'react';

type UseStepNavigationInput<T> = {
  steps: readonly T[];
  initialStep?: T;
  onExit?: () => void;
  circular?: boolean;
};

export function useStepNavigation<T>({
  steps,
  initialStep = steps[0],
  onExit,
  circular = false,
}: UseStepNavigationInput<T>) {
  const [step, setStep] = useState<T>(initialStep);

  useEffect(() => {
    setStep(initialStep);
  }, [steps, initialStep]);

  const toNextStep = useCallback(() => {
    setStep(prev => {
      const currentIndex = steps.indexOf(prev);

      if (currentIndex === steps.length - 1) {
        return circular ? steps[0] : prev;
      }

      return steps[currentIndex + 1];
    });
  }, [steps, circular]);

  const toPreviousStep = useCallback(() => {
    setStep(prev => {
      const currentIndex = steps.indexOf(prev);

      if (currentIndex === 0) {
        return circular ? steps[steps.length - 1] : (onExit?.(), prev);
      }

      return steps[currentIndex - 1];
    });
  }, [steps, circular, onExit]);

  return { step, setStep, toNextStep, toPreviousStep };
}
