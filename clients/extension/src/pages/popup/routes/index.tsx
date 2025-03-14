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
import {
  createHashRouter,
  Navigate,
  type RouteObject,
  RouterProvider,
} from 'react-router-dom'

interface RouteConfig {
  path: string
  element?: React.ReactNode
  children?: RouteConfig[]
  redirect?: string
}

const routes: RouteConfig[] = [
  {
    path: routerKeys.root,
    redirect: routerKeys.main,
  },
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
        path: routerKeys.root,
        redirect: routerKeys.main,
      },
      {
        path: routerKeys.main,
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
        redirect: routerKeys.root,
      },
    ],
  },
  {
    path: '*',
    redirect: routerKeys.root,
  },
]

const processRoutes = (routes: RouteConfig[]): RouteObject[] => {
  return routes.reduce<RouteObject[]>(
    (acc, { children, element, path, redirect }) => {
      if (redirect) {
        const processedRoute: RouteObject = {
          path,
          element: <Navigate to={redirect} replace />,
        }
        acc.push(processedRoute)
      } else if (element) {
        const processedRoute: RouteObject = {
          path,
          element,
          children: children ? processRoutes(children) : undefined,
        }
        acc.push(processedRoute)
      }

      return acc
    },
    []
  )
}

const router = createHashRouter(processRoutes(routes), {
  basename: routerKeys.basePath,
})

const Component = () => <RouterProvider router={router} />

export default Component
