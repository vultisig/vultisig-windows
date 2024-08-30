import { useNavigate } from 'react-router-dom';
import { ComponentWithChildrenProps } from '../../lib/ui/props';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { useVaults } from '../queries/useVaultsQuery';
import { useEffect } from 'react';

export const EmptyVaultsOnly = ({ children }: ComponentWithChildrenProps) => {
  const navigate = useNavigate();

  const vaults = useVaults();

  const hasVaults = !isEmpty(vaults);

  useEffect(() => {
    if (hasVaults) {
      navigate('/vault/list');
    }
  }, [hasVaults, navigate]);

  if (hasVaults) {
    return null;
  }

  return <>{children}</>;
};
