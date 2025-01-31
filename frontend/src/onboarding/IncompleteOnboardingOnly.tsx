import { useEffect } from 'react';

import { ChildrenProp } from '../lib/ui/props';
import { useAppNavigate } from '../navigation/hooks/useAppNavigate';
import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding';

export const IncompleteOnboardingOnly = ({ children }: ChildrenProp) => {
  const [hasCompletedOnboarding] = useHasFinishedOnboarding();

  const navigate = useAppNavigate();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate('root');
    }
  }, [hasCompletedOnboarding, navigate]);

  if (hasCompletedOnboarding) {
    return null;
  }

  return <>{children}</>;
};
