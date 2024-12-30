import { useEffect } from 'react';

import { ComponentWithChildrenProps } from '../lib/ui/props';
import { useAppNavigate } from '../navigation/hooks/useAppNavigate';
import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding';

export const CompletedOnboardingOnly = ({
  children,
}: ComponentWithChildrenProps) => {
  const [hasCompletedOnboarding] = useHasFinishedOnboarding();

  const navigate = useAppNavigate();

  const isDisabled = !hasCompletedOnboarding;

  useEffect(() => {
    if (isDisabled) {
      navigate('onboarding');
    }
  }, [isDisabled, navigate]);

  if (isDisabled) {
    return null;
  }

  return <>{children}</>;
};
