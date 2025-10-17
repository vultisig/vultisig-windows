import { useAppNavigate } from '@clients/desktop/src/navigation/hooks/useAppNavigate'
import { RefreshVaultBalance } from '@clients/desktop/src/vault/balance/RefreshVaultBalance'
import { UploadQrPrompt } from '@clients/desktop/src/vault/components/UploadQrPrompt'
import { VaultOverview } from '@clients/desktop/src/vault/components/VaultOverview'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { FastVaultPasswordVerification } from '@core/ui/mpc/fast/FastVaultPasswordVerification'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { IconButton } from '@lib/ui/buttons/IconButton'
import { MenuIcon } from '@lib/ui/icons/MenuIcon'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'
import { PageHeaderToggleTitle } from '@lib/ui/page/PageHeaderToggleTitle'

import { UpdatePrompt } from '../../versioning/UpdatePrompt'

export const VaultPage = () => {
  const vault = useCurrentVault()
  const { name, signers } = vault
  const isFastVault = hasServer(signers)
  const navigate = useAppNavigate()
  const vaultId = getVaultId(vault)

  return (
    <>
      <VStack flexGrow>
        <PageHeader
          hasBorder
          primaryControls={
            <IconButton onClick={() => navigate({ id: 'settings' })}>
              <MenuIcon />
            </IconButton>
          }
          secondaryControls={<RefreshVaultBalance />}
          title={
            <PageHeaderToggleTitle
              value={name}
              onClick={() => {
                navigate({ id: 'vaults' })
              }}
            />
          }
        />

        <UploadQrPrompt />
        <VaultOverview />
      </VStack>
      <UpdatePrompt />
      {isFastVault && <FastVaultPasswordVerification key={vaultId} />}
    </>
  )
}
