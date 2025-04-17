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
import MainPage from '@clients/extension/src/pages/popup/pages/main'
import RenameVaultPage from '@clients/extension/src/pages/popup/pages/rename-vault'
import SettingsPage from '@clients/extension/src/pages/popup/pages/settings'
import { SetupVaultPageController } from '@clients/extension/src/pages/popup/pages/setup-vault/SetupVaultPageController'
import VaultSettingsPage from '@clients/extension/src/pages/popup/pages/vault-settings'
import VaultsPage from '@clients/extension/src/pages/popup/pages/vaults'
import { corePaths } from '@core/ui/navigation'
import { createHashRouter, Navigate } from 'react-router-dom'

import { SetupFastVaultPage } from '../../components/setup/fast/SetupFastVaultPage'

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
    path: appPaths.setupFastVault,
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
    element: <Layout />,
    children: [
      {
        index: true,
        element: <MainPage />,
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
