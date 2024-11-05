import { useTranslation } from 'react-i18next';

import { Button } from '../../../lib/ui/buttons/Button';
import { useDeleteVaultFolderMutation } from '../mutations/useDeleteVaultFolderMutation';
import { useCurrentVaultFolder } from '../state/currentVaultFolder';

export const DeleteVaultFolder = () => {
  const { id } = useCurrentVaultFolder();

  const { mutate, isPending } = useDeleteVaultFolderMutation();

  const { t } = useTranslation();

  return (
    <Button kind="idle" isLoading={isPending} onClick={() => mutate(id)}>
      {t('delete_folder')}
    </Button>
  );
};
