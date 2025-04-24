import { IncompleteOnboardingOnly } from '@clients/extension/src/components/onboarding/components/IncompleteOnboardingOnly'
import { OnboardingPage } from '@clients/extension/src/components/onboarding/components/OnboardingPage'
import { appPaths } from '@clients/extension/src/navigation'
import Layout from '@clients/extension/src/pages/popup/layout'
import CurrencyPage from '@clients/extension/src/pages/popup/pages/currency'
import DeleteVaultPage from '@clients/extension/src/pages/popup/pages/delete-vault'
import ImportFilePage from '@clients/extension/src/pages/popup/pages/import-file'
import ImportQRPage from '@clients/extension/src/pages/popup/pages/import-qr'
import { NewVaultPage } from '@clients/extension/src/pages/popup/pages/landing'
import LanguagePage from '@clients/extension/src/pages/popup/pages/language'
import RenameVaultPage from '@clients/extension/src/pages/popup/pages/rename-vault'
import SettingsPage from '@clients/extension/src/pages/popup/pages/settings'
import { SetupVaultPageController } from '@clients/extension/src/pages/popup/pages/setup-vault/SetupVaultPageController'
import VaultSettingsPage from '@clients/extension/src/pages/popup/pages/vault-settings'
import VaultsPage from '@clients/extension/src/pages/popup/pages/vaults'
import { corePaths } from '@core/ui/navigation'
import { createHashRouter, Navigate } from 'react-router-dom'

import { ReshareFastVault } from '../../components/settings/reshare/ReshareFastVault'
import { ReshareSecureVault } from '../../components/settings/reshare/ReshareSecureVault'
import { SetupFastVaultPage } from '../../components/setup/SetupFastVaultPage'
import { SetupSecureVaultPage } from '../../components/setup/SetupSecureVaultPage'
import { MainPage } from '../../pages/popup/pages/main'
import { ReshareVaultPage } from '../../pages/popup/pages/reshare-vault/ReshareVaultPage'
import { ActiveVaultGuard } from '../../vault/components/ActiveVaultGuard'

const routes = [
  {
    path: appPaths.landing,
    element: <NewVaultPage />,
  },
  {
    path: appPaths.importQR,
    element: <ImportQRPage />,
  },
  {
    path: corePaths.importVault,
    element: <ImportFilePage />,
  },
  {
    path: corePaths.setupVault,
    element: <SetupVaultPageController />,
  },
  {
    path: corePaths.setupSecureVault,
    element: <SetupSecureVaultPage />,
  },
  {
    path: corePaths.setupFastVault,
    element: <SetupFastVaultPage />,
  },
  {
    path: appPaths.onboarding,
    element: (
      <IncompleteOnboardingOnly>
        <OnboardingPage />
      </IncompleteOnboardingOnly>
    ),
  },
  {
    path: appPaths.root,
    element: (
      <ActiveVaultGuard>
        <Layout />
      </ActiveVaultGuard>
    ),
    children: [
      {
        path: corePaths.reshareVault,
        element: (
          <ActiveVaultGuard>
            <ReshareVaultPage />
          </ActiveVaultGuard>
        ),
      },
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: corePaths.reshareVaultFast,
        element: (
          <ActiveVaultGuard>
            <ReshareFastVault />
          </ActiveVaultGuard>
        ),
      },
      {
        path: corePaths.reshareVaultSecure,
        element: (
          <ActiveVaultGuard>
            <ReshareSecureVault />
          </ActiveVaultGuard>
        ),
      },

      {
        path: appPaths.vaults,
        element: <VaultsPage />,
      },
      {
        path: appPaths.settings,
        element: <SettingsPage />,
      },
      {
        path: appPaths.currencySettings,
        element: <CurrencyPage />,
      },
      {
        path: appPaths.languageSettings,
        element: <LanguagePage />,
      },
      {
        path: appPaths.vaultSettings,
        element: <VaultSettingsPage />,
      },
      {
        path: appPaths.renameVault,
        element: <RenameVaultPage />,
      },
      {
        path: appPaths.deleteVault,
        element: <DeleteVaultPage />,
      },
      {
        path: '*',
        element: <Navigate to={appPaths.root} replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={appPaths.root} replace />,
  },
]

export const router = createHashRouter(routes, {
  basename: appPaths.root,
})
