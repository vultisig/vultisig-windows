import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDeleteVaultFolderMutation } from '@core/ui/storage/vaultFolders'
import { useCurrentVaultFolder } from '@core/ui/vaultsOrganisation/folder/state/currentVaultFolder'
import { Opener } from '@lib/ui/base/Opener'
import { Button } from '@lib/ui/button'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components'

const StyledIcon = styled(TrashIcon)`
  color: ${getColor('alertError')};
`

export const DeleteVaultFolder = () => {
  const { t } = useTranslation()
  const { id, name } = useCurrentVaultFolder()
  const { mutate, isPending } = useDeleteVaultFolderMutation()
  const navigate = useCoreNavigate()

  return (
    <Opener
      renderOpener={({ onOpen }) => (
        <Button
          icon={<StyledIcon fontSize={20} />}
          loading={isPending}
          onClick={onOpen}
          unstyled
        />
      )}
      renderContent={({ onClose }) => (
        <Modal isOpen={true} onClose={onClose} title={t('delete_folder')}>
          <VStack gap={16}>
            <Text color="contrast" size={16}>
              {t('delete_folder_confirmation', { name })}
            </Text>
            <VStack gap={8}>
              <Button
                label={t('delete')}
                loading={isPending}
                onClick={() =>
                  mutate(id, {
                    onSuccess: () => {
                      onClose()
                      navigate({ id: 'vaults' })
                    },
                    onError: error => console.error(error),
                  })
                }
              />
              <Button label={t('cancel')} onClick={onClose} type="secondary" />
            </VStack>
          </VStack>
        </Modal>
      )}
    />
  )
}
