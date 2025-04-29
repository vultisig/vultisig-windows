import { IncompleteOnboardingOnly } from '@clients/extension/src/components/onboarding/components/IncompleteOnboardingOnly'
import { OnboardingPage } from '@clients/extension/src/components/onboarding/components/OnboardingPage'
import { ReshareFastVault } from '@clients/extension/src/components/settings/reshare/ReshareFastVault'
import { ReshareSecureVault } from '@clients/extension/src/components/settings/reshare/ReshareSecureVault'
import { SetupFastVaultPage } from '@clients/extension/src/components/setup/SetupFastVaultPage'
import { SetupSecureVaultPage } from '@clients/extension/src/components/setup/SetupSecureVaultPage'
import { AppPath, appPaths } from '@clients/extension/src/navigation'
import { CurrencyPage } from '@clients/extension/src/pages/popup/pages/currency'
import DeleteVaultPage from '@clients/extension/src/pages/popup/pages/delete-vault'
import ImportFilePage from '@clients/extension/src/pages/popup/pages/import-file'
import ImportQRPage from '@clients/extension/src/pages/popup/pages/import-qr'
import { NewVaultPage } from '@clients/extension/src/pages/popup/pages/landing'
import { LanguagePage } from '@clients/extension/src/pages/popup/pages/language'
import { MainPage } from '@clients/extension/src/pages/popup/pages/main'
import { ManageChainsPage } from '@clients/extension/src/pages/popup/pages/manage-chains'
import { RenameVaultPage } from '@clients/extension/src/pages/popup/pages/rename-vault'
import { SettingsPage } from '@clients/extension/src/pages/popup/pages/settings'
import { SetupVaultPageController } from '@clients/extension/src/pages/popup/pages/setup-vault/SetupVaultPageController'
import { VaultSettingsPage } from '@clients/extension/src/pages/popup/pages/vault-settings'
import { VaultsPage } from '@clients/extension/src/pages/popup/pages/vaults'
import { ActiveVaultGuard } from '@clients/extension/src/vault/components/ActiveVaultGuard'
import { ReshareVaultPage } from '@core/ui/mpc/keygen/reshare/ReshareVaultPage'
import { CorePath, corePaths } from '@core/ui/navigation'
import { toEntries } from '@lib/utils/record/toEntries'
import { ReactNode } from 'react'
import { createHashRouter } from 'react-router-dom'

const coreRoutes: Record<CorePath, ReactNode> = {
  vault: <ActiveVaultGuard>TODO: Implement vault page</ActiveVaultGuard>,
  joinKeygen: <>TODO: Implement join keygen page</>,
  setupFastVault: <SetupFastVaultPage />,
  setupSecureVault: <SetupSecureVaultPage />,
  setupVault: <SetupVaultPageController />,
  importVault: <ImportFilePage />,
  keysign: <ActiveVaultGuard>TODO: Implement keysign page</ActiveVaultGuard>,
  reshareVault: (
    <ActiveVaultGuard>
      <ReshareVaultPage />
    </ActiveVaultGuard>
  ),
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
  renameVault: (
    <ActiveVaultGuard>
      <RenameVaultPage />
    </ActiveVaultGuard>
  ),
  vaultSettings: (
    <ActiveVaultGuard>
      <VaultSettingsPage />
    </ActiveVaultGuard>
  ),
  languageSettings: <LanguagePage />,
  currencySettings: <CurrencyPage />,
  settings: <SettingsPage />,
  manageChains: (
    <ActiveVaultGuard>
      <ManageChainsPage />
    </ActiveVaultGuard>
  ),
  root: (
    <ActiveVaultGuard>
      <MainPage />
    </ActiveVaultGuard>
  ),
  onboarding: (
    <IncompleteOnboardingOnly>
      <OnboardingPage />
    </IncompleteOnboardingOnly>
  ),
  landing: <NewVaultPage />,
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
    basename: appPaths.root,
  }
)
