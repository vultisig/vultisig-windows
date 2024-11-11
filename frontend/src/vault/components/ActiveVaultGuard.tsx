import { useEffect } from 'react';

import { ComponentWithChildrenProps } from '../../lib/ui/props';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { useCurrentVault } from '../state/useCurrentVault';

export const ActiveVaultGuard: React.FC<ComponentWithChildrenProps> = ({
  children,
}) => {
  const vault = useCurrentVault();

  const navigate = useAppNavigate();

  const isDisabled = !vault;

  useEffect(() => {
    if (isDisabled) {
      navigate('root');
    }
  }, [isDisabled, navigate]);

  if (isDisabled) {
    return null;
  }

  return <>{children}</>;
};
