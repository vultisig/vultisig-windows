import { useTranslation } from 'react-i18next'

import { Button } from '../../lib/ui/buttons/Button'
import { PlusIcon } from '../../lib/ui/icons/PlusIcon'
import { HStack, VStack } from '../../lib/ui/layout/Stack'
import { useAppNavigate } from '../../navigation/hooks/useAppNavigate'

export const ManageVaultCreation = () => {
  const navigate = useAppNavigate()
  const { t } = useTranslation()

  return (
    <VStack gap={20}>
      <Button
        onClick={() => {
          navigate('newVault')
        }}
        kind="primary"
      >
        <HStack alignItems="center" gap={8}>
          <PlusIcon /> {t('add_new_vault')}
        </HStack>
      </Button>
    </VStack>
  )
}
