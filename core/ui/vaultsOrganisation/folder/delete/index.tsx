import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDeleteVaultFolderMutation } from '@core/ui/storage/vaultFolders'
import { useCurrentVaultFolder } from '@core/ui/vaultsOrganisation/folder/state/currentVaultFolder'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import { getColor } from '@lib/ui/theme/getters'
import { useToast } from '@lib/ui/toast/ToastProvider'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledIcon = styled(TrashIcon)`
  color: ${getColor('danger')};
`

export const DeleteVaultFolder = () => {
  const { t } = useTranslation()
  const { id } = useCurrentVaultFolder()
  const { mutate, isPending } = useDeleteVaultFolderMutation()
  const navigate = useCoreNavigate()
  const { addToast } = useToast()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <UnstyledButton onClick={onOpen}>
          {isPending ? <Spinner /> : <StyledIcon fontSize={20} />}
        </UnstyledButton>
      )}
      renderContent={({ onClose }) => (
        <Modal isOpen={true} onClose={onClose} title={t('delete_folder')}>
          <VStack gap={8}>
            <Button
              loading={isPending}
              onClick={() =>
                mutate(id, {
                  onSuccess: () => {
                    onClose()
                    navigate({ id: 'vaults' })
                  },
                  onError: error => {
                    console.error(error)
                    addToast({
                      message: t('failed_to_delete_folder'),
                    })
                  },
                })
              }
            >
              {t('delete')}
            </Button>
            <Button kind="secondary" onClick={onClose}>
              {t('cancel')}
            </Button>
          </VStack>
        </Modal>
      )}
    />
  )
}
