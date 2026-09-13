import { CurrentVaultFolderPageProvider } from '../provider'
import { UpdateVaultFolderPage } from '.'

/** The update-folder page under its current-folder provider, as registered in the shared navigation. */
export const UpdateVaultFolderView = () => (
  <CurrentVaultFolderPageProvider>
    <UpdateVaultFolderPage />
  </CurrentVaultFolderPageProvider>
)
