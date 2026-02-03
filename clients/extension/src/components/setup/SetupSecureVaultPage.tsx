import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateSecureVaultFlow } from '@core/ui/mpc/keygen/create/secure/CreateSecureVaultFlow'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeyImportConfigProviders } from '@core/ui/mpc/keygen/keyimport/KeyImportConfigProviders'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'

export const SetupSecureVaultPage = () => {
  const [state] = useCoreViewState<'setupSecureVault'>()
  const keyImportInput = state?.keyImportInput

  const content = <CreateSecureVaultFlow />

  return (
    <VaultSecurityTypeProvider value="secure">
      <CreateVaultFlowProviders>
        {keyImportInput ? (
          <KeyImportConfigProviders keyImportInput={keyImportInput}>
            {content}
          </KeyImportConfigProviders>
        ) : (
          content
        )}
      </CreateVaultFlowProviders>
    </VaultSecurityTypeProvider>
  )
}
