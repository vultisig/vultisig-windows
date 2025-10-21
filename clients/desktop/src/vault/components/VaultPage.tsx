import { UploadQrPrompt } from '@clients/desktop/src/vault/components/UploadQrPrompt'
import { VaultOverview } from '@clients/desktop/src/vault/components/VaultOverview'
import { hasServer } from '@core/mpc/devices/localPartyId'
import { FastVaultPasswordVerification } from '@core/ui/mpc/fast/FastVaultPasswordVerification'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { getVaultId } from '@core/ui/vault/Vault'
import { VStack } from '@lib/ui/layout/Stack'
import { PageHeader } from '@lib/ui/page/PageHeader'

import { UpdatePrompt } from '../../versioning/UpdatePrompt'
import { VaultPageHeaderControls } from './VaultPageHeaderControls'
import { VaultSelector } from './VaultSelector'

export const VaultPage = () => {
  const vault = useCurrentVault()
  const { signers } = vault
  const isFastVault = hasServer(signers)
  const vaultId = getVaultId(vault)

  return (
    <>
      <VStack flexGrow>
        <PageHeader
          hasBorder
          secondaryControls={<VaultPageHeaderControls />}
          title={<VaultSelector value={vault} />}
        />

        <UploadQrPrompt />
        <VaultOverview />
      </VStack>
      <UpdatePrompt />
      {isFastVault && <FastVaultPasswordVerification key={vaultId} />}
    </>
  )
}
