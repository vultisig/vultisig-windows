import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ComponentWithChildrenProps } from '../lib/ui/props';
import { addVaultPath } from '../navigation';
import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding';

export const IncompleteOnboardingOnly = ({
  children,
}: ComponentWithChildrenProps) => {
  const [hasCompletedOnboarding] = useHasFinishedOnboarding();

  const navigate = useNavigate();

  useEffect(() => {
    if (hasCompletedOnboarding) {
      navigate(addVaultPath);
    }
  }, [hasCompletedOnboarding, navigate]);

  if (hasCompletedOnboarding) {
    return null;
  }

  return <>{children}</>;
};
