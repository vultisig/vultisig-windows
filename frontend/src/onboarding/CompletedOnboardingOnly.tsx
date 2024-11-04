import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ComponentWithChildrenProps } from '../lib/ui/props';
import { makeAppPath } from '../navigation';
import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding';

export const CompletedOnboardingOnly = ({
  children,
}: ComponentWithChildrenProps) => {
  const [hasCompletedOnboarding] = useHasFinishedOnboarding();

  const navigate = useNavigate();

  const isDisabled = !hasCompletedOnboarding;

  useEffect(() => {
    if (isDisabled) {
      navigate(makeAppPath('onboarding'));
    }
  }, [isDisabled, navigate]);

  if (isDisabled) {
    return null;
  }

  return <>{children}</>;
};
