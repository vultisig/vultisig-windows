import { useCoreNavigate } from '@core/ui/navigation/hooks/useCoreNavigate'
import { useDeleteVaultFolderMutation } from '@core/ui/storage/vaultFolders'
import { Button } from '@lib/ui/buttons/Button'
import { UnstyledButton } from '@lib/ui/buttons/UnstyledButton'
import { TrashIcon } from '@lib/ui/icons/TrashIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { Modal } from '@lib/ui/modal'
import { Text } from '@lib/ui/text'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

import { useCurrentVaultFolder } from '../state/currentVaultFolder'

export const DeleteVaultFolder = () => {
  const { t } = useTranslation()
  const navigate = useCoreNavigate()
  const { id, name } = useCurrentVaultFolder()
  const { mutate, isPending } = useDeleteVaultFolderMutation()
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <UnstyledButton onClick={() => setIsModalOpen(true)}>
        {isPending ? (
          <Spinner />
        ) : (
          <TrashIcon width={20} height={20} stroke="#FFA500" />
        )}
      </UnstyledButton>

      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={t('delete_folder')}
        >
          <VStack gap={16}>
            <Text color="contrast" size={16}>
              {t('delete_folder_confirmation', { name })}
            </Text>
            <VStack gap={8}>
              <Button
                onClick={() => {
                  mutate(id, {
                    onSuccess: () => {
                      setIsModalOpen(false)
                      navigate({ id: 'vaults' })
                    },
                  })
                }}
                isLoading={isPending}
                kind="primary"
              >
                {t('delete')}
              </Button>
              <Button onClick={() => setIsModalOpen(false)} kind="secondary">
                {t('cancel')}
              </Button>
            </VStack>
          </VStack>
        </Modal>
      )}
    </>
  )
}
