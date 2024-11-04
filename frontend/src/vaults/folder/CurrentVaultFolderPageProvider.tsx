import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { ComponentWithChildrenProps } from '../../lib/ui/props';
import { makeAppPath } from '../../navigation';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { useVaultFolder } from '../folders/queries/useVaultFoldersQuery';
import { VaultFolderProvider } from './state/currentVaultFolder';

export const CurrentVaultFolderPageProvider = ({
  children,
}: ComponentWithChildrenProps) => {
  const [{ id }] = useAppPathParams<'vaultFolder'>();

  const value = useVaultFolder(id);

  const navigate = useNavigate();

  useEffect(() => {
    if (!value) {
      navigate(makeAppPath('vaults'));
    }
  }, [navigate, value]);

  if (!value) {
    return null;
  }

  return <VaultFolderProvider value={value}>{children}</VaultFolderProvider>;
};
