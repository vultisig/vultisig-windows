import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ComponentWithChildrenProps } from '../lib/ui/props';
import { makeAppPath } from '../navigation';
import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding';

export const IncompleteOnboardingOnly = ({
  children,
}: ComponentWithChildrenProps) => {
  const [hasCompletedOnboarding] = useHasFinishedOnboarding();

  const navigate = useNavigate();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate(makeAppPath('root'));
    }
  }, [hasCompletedOnboarding, navigate]);

  if (hasCompletedOnboarding) {
    return null;
  }

  return <>{children}</>;
};
