import { CreateFastVaultFlow } from '@core/ui/mpc/keygen/create/fast/CreateFastVaultFlow'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeyImportConfigProviders } from '@core/ui/mpc/keygen/keyimport/KeyImportConfigProviders'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'

export const SetupFastVaultPage = () => {
  const [state] = useCoreViewState<'setupFastVault'>()
  const keyImportInput = state?.keyImportInput

  const content = <CreateFastVaultFlow />

  return (
    <VaultSecurityTypeProvider value="fast">
      <KeygenOperationProvider value={{ create: true }}>
        {keyImportInput ? (
          <KeyImportConfigProviders keyImportInput={keyImportInput}>
            {content}
          </KeyImportConfigProviders>
        ) : (
          content
        )}
      </KeygenOperationProvider>
    </VaultSecurityTypeProvider>
  )
}
