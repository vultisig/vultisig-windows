import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateFastVaultFlow } from '@core/ui/mpc/keygen/create/fast/CreateFastVaultFlow'
import { PasswordHintProvider } from '@core/ui/mpc/keygen/create/fast/server/password-hint/state/password-hint'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeyImportConfigProviders } from '@core/ui/mpc/keygen/keyimport/KeyImportConfigProviders'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'
import { EmailProvider } from '@core/ui/state/email'
import { PasswordProvider } from '@core/ui/state/password'

export const SetupFastVaultPage = () => {
  const [state] = useCoreViewState<'setupFastVault'>()
  const keyImportInput = state?.keyImportInput

  const content = <CreateFastVaultFlow />

  return (
    <VaultSecurityTypeProvider value="fast">
      <EmailProvider initialValue="">
        <PasswordProvider initialValue="">
          <PasswordHintProvider initialValue="">
            <CreateVaultFlowProviders>
              {keyImportInput ? (
                <KeyImportConfigProviders keyImportInput={keyImportInput}>
                  {content}
                </KeyImportConfigProviders>
              ) : (
                content
              )}
            </CreateVaultFlowProviders>
          </PasswordHintProvider>
        </PasswordProvider>
      </EmailProvider>
    </VaultSecurityTypeProvider>
  )
}
