import { PendingReferralProvider } from '@core/ui/mpc/keygen/create/state/pendingReferral'
import { GeneratedVaultNameProvider } from '@core/ui/mpc/keygen/create/state/vaultName'
import { KeyImportChainsProvider } from '@core/ui/mpc/keygen/keyimport/state/keyImportChains'
import { KeygenOperationProvider } from '@core/ui/mpc/keygen/state/currentKeygenOperationType'
import { ChildrenProp } from '@lib/ui/props'

export const CreateVaultFormStateProviders = ({ children }: ChildrenProp) => {
  return (
    <KeygenOperationProvider value={{ create: true }}>
      <KeyImportChainsProvider value={[]}>
        <GeneratedVaultNameProvider>
          <PendingReferralProvider initialValue="">
            {children}
          </PendingReferralProvider>
        </GeneratedVaultNameProvider>
      </KeyImportChainsProvider>
    </KeygenOperationProvider>
  )
}
