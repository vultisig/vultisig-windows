import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ComponentWithChildrenProps } from '../../lib/ui/props';
import { isEmpty } from '../../lib/utils/array/isEmpty';
import { makeAppPath } from '../../navigation';
import { useVaults } from '../queries/useVaultsQuery';

export const EmptyVaultsOnly = ({ children }: ComponentWithChildrenProps) => {
  const navigate = useNavigate();

  const vaults = useVaults();

  const hasVaults = !isEmpty(vaults);

  useEffect(() => {
    if (hasVaults) {
      navigate(makeAppPath('vaultList'));
    }
  }, [hasVaults, navigate]);

  if (hasVaults) {
    return null;
  }

  return <>{children}</>;
};
