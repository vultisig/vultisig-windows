import { VaultFolderPage } from '.'
import { CurrentVaultFolderPageProvider } from './provider'

/** The vault folder page under its current-folder provider, as registered in the shared navigation. */
export const VaultFolderView = () => (
  <CurrentVaultFolderPageProvider>
    <VaultFolderPage />
  </CurrentVaultFolderPageProvider>
)
