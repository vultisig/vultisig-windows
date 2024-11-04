import { useAppPathParams } from '../../../navigation/hooks/useAppPathParams';
import { useVaultFolder } from '../../folders/queries/useVaultFoldersQuery';

export const useCurrentVaultFolder = () => {
  const [{ id }] = useAppPathParams<'vaultFolder'>();

  return useVaultFolder(id);
};
