import Layout from '@clients/extension/src/pages/popup/layout'
import CurrencyPage from '@clients/extension/src/pages/popup/pages/currency'
import DeleteVaultPage from '@clients/extension/src/pages/popup/pages/delete-vault'
import ImportPage from '@clients/extension/src/pages/popup/pages/import'
import LandingPage from '@clients/extension/src/pages/popup/pages/landing'
import LanguagePage from '@clients/extension/src/pages/popup/pages/language'
import MainPage from '@clients/extension/src/pages/popup/pages/main'
import RenameVaultPage from '@clients/extension/src/pages/popup/pages/rename-vault'
import SettingsPage from '@clients/extension/src/pages/popup/pages/settings'
import VaultSettingsPage from '@clients/extension/src/pages/popup/pages/vault-settings'
import VaultsPage from '@clients/extension/src/pages/popup/pages/vaults'
import routerKeys from '@clients/extension/src/utils/route-keys'
import { createHashRouter, Navigate } from 'react-router-dom'

const routes = [
  {
    path: routerKeys.landing,
    element: <LandingPage />,
  },
  {
    path: routerKeys.import,
    element: <ImportPage />,
  },
  {
    path: routerKeys.root,
    element: <Layout />,
    children: [
      {
        index: true,
        element: <MainPage />,
      },
      {
        path: routerKeys.vaults,
        element: <VaultsPage />,
      },
      {
        path: routerKeys.settings.root,
        element: <SettingsPage />,
      },
      {
        path: routerKeys.settings.currency,
        element: <CurrencyPage />,
      },
      {
        path: routerKeys.settings.language,
        element: <LanguagePage />,
      },
      {
        path: routerKeys.settings.vault,
        element: <VaultSettingsPage />,
      },
      {
        path: routerKeys.settings.rename,
        element: <RenameVaultPage />,
      },
      {
        path: routerKeys.settings.delete,
        element: <DeleteVaultPage />,
      },
      {
        path: '*',
        element: <Navigate to={routerKeys.root} replace />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={routerKeys.root} replace />,
  },
]

export const router = createHashRouter(routes, {
  basename: routerKeys.basePath,
})
