import { hasServerSigner } from '@clients/desktop/src/vault/fast/utils/hasServerSigner'
import { Vault } from '@core/ui/vault/Vault'
import { getValueProviderSetup } from '@lib/ui/state/getValueProviderSetup'
import { useMemo } from 'react'

export const { useValue: useCurrentVault, provider: CurrentVaultProvider } =
  getValueProviderSetup<Vault>('CurrentVault')

export const useVaultServerStatus = () => {
  const { signers, localPartyId } = useCurrentVault()

  return useMemo(() => {
    const isBackupServerShare = localPartyId
      ?.toLowerCase()
      .startsWith('server-')

    return {
      hasServer: hasServerSigner(signers) && !isBackupServerShare,
      isBackup: isBackupServerShare,
    }
  }, [signers, localPartyId])
}
