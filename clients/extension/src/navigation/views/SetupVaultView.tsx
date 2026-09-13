import { ExpandViewGuard } from '@clients/extension/src/components/expand-view-guard'
import { SetupVaultPageController } from '@clients/extension/src/pages/setup-vault/SetupVaultPageController'
import { ResponsivenessProvider } from '@core/ui/providers/ResponsivenessProvider'

/** Vault setup, which only runs in the expanded view. */
export const SetupVaultView = () => (
  <ExpandViewGuard>
    <ResponsivenessProvider>
      <SetupVaultPageController />
    </ResponsivenessProvider>
  </ExpandViewGuard>
)
