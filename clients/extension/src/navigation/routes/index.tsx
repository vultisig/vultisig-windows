import Layout from '@clients/extension/src/pages/popup/layout'
import CurrencyPage from '@clients/extension/src/pages/popup/pages/currency'
import DeleteVaultPage from '@clients/extension/src/pages/popup/pages/delete-vault'
import ImportPage from '@clients/extension/src/pages/popup/pages/import'
import { NewVaultPage } from '@clients/extension/src/pages/popup/pages/landing'
import LanguagePage from '@clients/extension/src/pages/popup/pages/language'
import MainPage from '@clients/extension/src/pages/popup/pages/main'
import RenameVaultPage from '@clients/extension/src/pages/popup/pages/rename-vault'
import SettingsPage from '@clients/extension/src/pages/popup/pages/settings'
import VaultSettingsPage from '@clients/extension/src/pages/popup/pages/vault-settings'
import VaultsPage from '@clients/extension/src/pages/popup/pages/vaults'
import { createHashRouter, Navigate } from 'react-router-dom'

import { IncompleteOnboardingOnly } from '../../components/onboarding/components/IncompleteOnboardingOnly'
import { OnboardingPage } from '../../components/onboarding/components/OnboardingPage'
import { SetupVaultPageController } from '../../pages/popup/pages/setup-vault/SetupVaultPageController'
import { appPaths } from '..'

const routes = [
  {
    path: appPaths.landing,
    element: <NewVaultPage />,
  },
  {
    path: appPaths.import,
    element: <ImportPage />,
  },
  {
    path: appPaths.setupVault,
    element: <SetupVaultPageController />,
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
        path: appPaths.onboarding,
        element: (
          <IncompleteOnboardingOnly>
            <OnboardingPage />
          </IncompleteOnboardingOnly>
        ),
      },

      {
        path: appPaths.vaults,
        element: <VaultsPage />,
      },
      {
        path: appPaths.settings.root,
        element: <SettingsPage />,
      },
      {
        path: appPaths.settings.currency,
        element: <CurrencyPage />,
      },
      {
        path: appPaths.settings.language,
        element: <LanguagePage />,
      },
      {
        path: appPaths.settings.vault,
        element: <VaultSettingsPage />,
      },
      {
        path: appPaths.settings.rename,
        element: <RenameVaultPage />,
      },
      {
        path: appPaths.settings.delete,
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
