import { Match } from '../../../lib/ui/base/Match';
import { useStepNavigation } from '../../../lib/ui/hooks/useStepNavigation';
import { OnboardingGreeting } from './OnboardingGreeting';
import { OnboardingSteps } from './OnboardingSteps';
import { OnboardingSummary } from './OnboardingSummary';

const steps = [
  'onboardingGreeting',
  'onboardingSteps',
  'onboardingSummary',
] as const;

export const OnboardingController = () => {
  const { step, toNextStep } = useStepNavigation({ steps });

  return (
    <Match
      value={step}
      onboardingGreeting={() => (
        <OnboardingGreeting onCompleteGreeting={toNextStep} />
      )}
      onboardingSteps={() => <OnboardingSteps onCompleteSteps={toNextStep} />}
      onboardingSummary={() => <OnboardingSummary />}
    />
  );
};
