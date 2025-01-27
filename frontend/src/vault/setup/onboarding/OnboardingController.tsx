import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { OnboardingGreeting } from './OnboardingGreeting';
import { OnboardingStepProgressController } from './OnboardingStepProgressController';

const steps = ['onboardingGreeting', 'onboardingSteps'] as const;

export const OnboardingController = () => {
  const { step, toNextStep } = useStepNavigation({ steps });

  return (
    <Match
      value={step}
      onboardingGreeting={() => <OnboardingGreeting onNextStep={toNextStep} />}
      onboardingSteps={() => <OnboardingStepProgressController />}
    />
  );
};
