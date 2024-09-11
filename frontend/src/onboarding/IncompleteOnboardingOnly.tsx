import { useEffect } from 'react';
import { ComponentWithChildrenProps } from '../lib/ui/props';
import { useHasFinishedOnboarding } from './hooks/useHasFinishedOnboarding';
import { addVaultPath } from '../navigation';
import { useNavigate } from 'react-router-dom';

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
