import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateVaultKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { CreateSecureVaultFlow } from '@core/ui/mpc/keygen/create/secure/CreateSecureVaultFlow'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeyImportKeygenWrapper } from '@core/ui/mpc/keygen/keyimport/KeyImportKeygenWrapper'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'

export const SetupSecureVaultPage = () => {
  const [state] = useCoreViewState<'setupSecureVault'>()
  const keyImportInput = state?.keyImportInput

  const content = <CreateSecureVaultFlow />

  const wrappedContent = keyImportInput ? (
    <KeyImportKeygenWrapper keyImportInput={keyImportInput}>
      {content}
    </KeyImportKeygenWrapper>
  ) : (
    <CreateVaultKeygenActionProvider>{content}</CreateVaultKeygenActionProvider>
  )

  return (
    <VaultSecurityTypeProvider value="secure">
      <CreateVaultFlowProviders>{wrappedContent}</CreateVaultFlowProviders>
    </VaultSecurityTypeProvider>
  )
}
