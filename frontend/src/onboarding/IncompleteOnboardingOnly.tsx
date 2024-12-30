import { useEffect } from 'react';

import { ComponentWithChildrenProps } from '../lib/ui/props';
import { useAppNavigate } from '../navigation/hooks/useAppNavigate';
import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding';

export const IncompleteOnboardingOnly = ({
  children,
}: ComponentWithChildrenProps) => {
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
