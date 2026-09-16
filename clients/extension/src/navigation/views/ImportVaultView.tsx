import { ExpandViewGuard } from '@clients/extension/src/components/expand-view-guard'
import { ImportVaultPage } from '@core/ui/vault/import/components/ImportVaultPage'

/** Vault import, which only runs in the expanded view. */
export const ImportVaultView = () => (
  <ExpandViewGuard>
    <ImportVaultPage />
  </ExpandViewGuard>
)
