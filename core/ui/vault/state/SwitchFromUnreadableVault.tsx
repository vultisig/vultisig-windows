import { useCore } from '@core/ui/state/core'
import {
  useCurrentVaultId,
  useSetCurrentVaultIdMutation,
} from '@core/ui/storage/currentVaultId'
import { useVaults } from '@core/ui/storage/vaults'
import { VaultListItem } from '@core/ui/vaultsOrganisation/components/VaultListItem'
import { Button } from '@lib/ui/buttons/Button'
import { VStack } from '@lib/ui/layout/Stack'
import { ResponsiveModal } from '@lib/ui/modal/ResponsiveModal'
import { getVaultId } from '@vultisig/core-mpc/vault/Vault'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Lets the user leave a vault whose shares cannot be read for any other stored
 * vault, which then goes through the same share read as any vault picked from
 * the vault list. Renders nothing when this is the only vault.
 */
export const SwitchFromUnreadableVault = () => {
  const { t } = useTranslation()
  const { goHome } = useCore()
  const currentVaultId = useCurrentVaultId()
  const otherVaults = useVaults().filter(
    vault => getVaultId(vault) !== currentVaultId
  )
  const { mutate: setCurrentVaultId } = useSetCurrentVaultIdMutation()
  const [isOpen, setIsOpen] = useState(false)

  if (otherVaults.length === 0) {
    return null
  }

  return (
    <>
      <Button kind="secondary" onClick={() => setIsOpen(true)}>
        {t('select_vault')}
      </Button>
      <ResponsiveModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={t('select_vault')}
      >
        <VStack gap={8}>
          {otherVaults.map(vault => (
            <VaultListItem
              key={getVaultId(vault)}
              vault={vault}
              onSelect={() => {
                setCurrentVaultId(getVaultId(vault), { onSuccess: goHome })
                setIsOpen(false)
              }}
            />
          ))}
        </VStack>
      </ResponsiveModal>
    </>
  )
}
