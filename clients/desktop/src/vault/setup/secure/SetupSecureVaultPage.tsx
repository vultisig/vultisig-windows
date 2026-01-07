import { CreateVaultFlowProviders } from '@core/ui/mpc/keygen/create/CreateVaultFlowProviders'
import { CreateSecureVaultFlow } from '@core/ui/mpc/keygen/create/secure/CreateSecureVaultFlow'
import { VaultSecurityTypeProvider } from '@core/ui/mpc/keygen/create/state/vaultSecurityType'
import { KeyImportKeygenWrapper } from '@core/ui/mpc/keygen/keyimport/KeyImportKeygenWrapper'
import { useCoreViewState } from '@core/ui/navigation/hooks/useCoreViewState'

import { MpcMediatorManager } from '../../../mpc/serverType/MpcMediatorManager'
import { CreateVaultKeygenActionProvider } from '../../keygen/create/CreateVaultKeygenActionProvider'

export const SetupSecureVaultPage = () => {
  const [state] = useCoreViewState<'setupSecureVault'>()
  const keyImportInput = state?.keyImportInput

  const content = (
    <>
      <MpcMediatorManager />
      <CreateSecureVaultFlow />
    </>
  )

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
