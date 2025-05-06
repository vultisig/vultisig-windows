import { OnboardingPage } from '@clients/extension/src/components/onboarding/components/OnboardingPage'
import { ReshareFastVault } from '@clients/extension/src/components/settings/reshare/ReshareFastVault'
import { ReshareSecureVault } from '@clients/extension/src/components/settings/reshare/ReshareSecureVault'
import { SetupFastVaultPage } from '@clients/extension/src/components/setup/SetupFastVaultPage'
import { SetupSecureVaultPage } from '@clients/extension/src/components/setup/SetupSecureVaultPage'
import { AppPath, appPaths } from '@clients/extension/src/navigation'
import { ConnectedDappsPage } from '@clients/extension/src/pages/popup/pages/connected-dapps'
import DeleteVaultPage from '@clients/extension/src/pages/popup/pages/delete-vault'
import ImportFilePage from '@clients/extension/src/pages/popup/pages/import-file'
import ImportQRPage from '@clients/extension/src/pages/popup/pages/import-qr'
import { LanguagePage } from '@clients/extension/src/pages/popup/pages/language'
import { NewVaultPage } from '@clients/extension/src/pages/popup/pages/new-vault'
import { SettingsPage } from '@clients/extension/src/pages/popup/pages/settings'
import { SetupVaultPageController } from '@clients/extension/src/pages/popup/pages/setup-vault/SetupVaultPageController'
import { VaultPage } from '@clients/extension/src/pages/popup/pages/vault'
import { VaultSettingsPage } from '@clients/extension/src/pages/popup/pages/vault-settings'
import { VaultsPage } from '@clients/extension/src/pages/popup/pages/vaults'
import { CorePath, corePaths } from '@core/ui/navigation'
import { sharedRoutes } from '@core/ui/navigation/routes'
import { IncompleteOnboardingOnly } from '@core/ui/onboarding/IncompleteOnboardingOnly'
import { ActiveVaultGuard } from '@core/ui/vault/ActiveVaultGuard'
import { toEntries } from '@lib/utils/record/toEntries'
import { ReactNode } from 'react'
import { createHashRouter } from 'react-router-dom'

const coreRoutes: Record<CorePath, ReactNode> = {
  ...sharedRoutes,
  vault: (
    <ActiveVaultGuard>
      <VaultPage />
    </ActiveVaultGuard>
  ),
  joinKeygen: <>TODO: Implement join keygen page</>,
  setupFastVault: <SetupFastVaultPage />,
  setupSecureVault: <SetupSecureVaultPage />,
  setupVault: <SetupVaultPageController />,
  importVault: <ImportFilePage />,
  newVault: <NewVaultPage />,
  keysign: <ActiveVaultGuard>TODO: Implement keysign page</ActiveVaultGuard>,
  reshareVaultFast: (
    <ActiveVaultGuard>
      <ReshareFastVault />
    </ActiveVaultGuard>
  ),
  reshareVaultSecure: (
    <ActiveVaultGuard>
      <ReshareSecureVault />
    </ActiveVaultGuard>
  ),
  joinKeysign: (
    <ActiveVaultGuard>TODO: Implement join keysign page</ActiveVaultGuard>
  ),
  uploadQr: <ImportQRPage />,
  vaults: (
    <ActiveVaultGuard>
      <VaultsPage />
    </ActiveVaultGuard>
  ),
}

const appRoutes: Record<AppPath, ReactNode> = {
  deleteVault: (
    <ActiveVaultGuard>
      <DeleteVaultPage />
    </ActiveVaultGuard>
  ),
  vaultSettings: (
    <ActiveVaultGuard>
      <VaultSettingsPage />
    </ActiveVaultGuard>
  ),
  languageSettings: <LanguagePage />,
  settings: <SettingsPage />,
  connectedDapps: (
    <ActiveVaultGuard>
      <ConnectedDappsPage />
    </ActiveVaultGuard>
  ),
  onboarding: (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
}

export const router = createHashRouter(
  [
    ...toEntries(coreRoutes).map(({ key, value }) => ({
      path: corePaths[key],
      element: value,
    })),
    ...toEntries(appRoutes).map(({ key, value }) => ({
      path: appPaths[key],
      element: value,
    })),
  ],
  {
    basename: corePaths.vault,
  }
)
