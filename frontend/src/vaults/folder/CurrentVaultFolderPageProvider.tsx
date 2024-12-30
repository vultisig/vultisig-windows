import { useEffect } from 'react';

import { ComponentWithChildrenProps } from '../../lib/ui/props';
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate';
import { useAppPathParams } from '../../navigation/hooks/useAppPathParams';
import { useVaultFolder } from '../folders/queries/useVaultFoldersQuery';
import { VaultFolderProvider } from './state/currentVaultFolder';

export const CurrentVaultFolderPageProvider = ({
  children,
}: ComponentWithChildrenProps) => {
  const [{ id }] = useAppPathParams<'vaultFolder'>();

  const value = useVaultFolder(id);

  const navigate = useAppNavigate();

  useEffect(() => {
    if (!value) {
      navigate('vaults');
    }
  }, [navigate, value]);

  if (!value) {
    return null;
  }

  return <VaultFolderProvider value={value}>{children}</VaultFolderProvider>;
};
