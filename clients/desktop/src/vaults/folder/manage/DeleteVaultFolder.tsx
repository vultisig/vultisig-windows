import { useDeleteVaultFolderMutation } from '@core/ui/storage/vaultFolders'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { Spinner } from '@lib/ui/loaders/Spinner'

import { useCurrentVaultFolder } from '../state/currentVaultFolder'

export const DeleteVaultFolder = () => {
  const { id } = useCurrentVaultFolder()
  const { mutate, isPending } = useDeleteVaultFolderMutation()

  return (
    <UnstyledButton onClick={() => mutate(id)}>
      {isPending ? (
        <Spinner />
      ) : (
        <TrashIcon width={20} height={20} stroke="#FFA500" />
      )}
    </UnstyledButton>
  )
}
