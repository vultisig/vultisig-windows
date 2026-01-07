import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateVaultKeygenActionProvider as DKLSKeygenActionProvider } from '@core/ui/mpc/keygen/create/CreateVaultKeygenActionProvider'
import { CreateFastVaultFlow } from '@core/ui/mpc/keygen/create/fast/CreateFastVaultFlow'
import { PasswordHintProvider } from '@core/ui/mpc/keygen/create/fast/server/password-hint/state/password-hint'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeyImportKeygenWrapper } from '@core/ui/mpc/keygen/keyimport/KeyImportKeygenWrapper'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

export const SetupFastVaultPage = () => {
  const [state] = useCoreViewState<'setupFastVault'>()
  const keyImportInput = state?.keyImportInput

  const content = <CreateFastVaultFlow />

  const wrappedContent = keyImportInput ? (
    <KeyImportKeygenWrapper keyImportInput={keyImportInput}>
      {content}
    </KeyImportKeygenWrapper>
  ) : (
    <DKLSKeygenActionProvider>{content}</DKLSKeygenActionProvider>
  )

  return (
    <VaultSecurityTypeProvider value="fast">
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <PasswordHintProvider initialValue="">
            <CreateVaultFlowProviders>
              {wrappedContent}
            </CreateVaultFlowProviders>
          </PasswordHintProvider>
        </PasswordProvider>
      </EmailProvider>
    </VaultSecurityTypeProvider>
  )
}
