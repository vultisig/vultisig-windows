import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/popup/index.scss'

import ConfigProvider from '@clients/extension/src/components/config-provider'
import ImportPage from '@clients/extension/src/pages/popup/pages/import'
import routerKeys from '@clients/extension/src/utils/route-keys'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'

import { ExtensionProviders } from '../../state/ExtensionProviders'

const router = createHashRouter(
  [
    {
      path: routerKeys.root,
      element: <ImportPage />,
    },
    {
      path: '*',
      element: <Navigate to={routerKeys.root} replace />,
    },
  ],
  {
    basename: routerKeys.basePath,
  }
)

const Component = () => {
  return (
    <ConfigProvider>
      <WalletCoreProvider>
        <RouterProvider router={router} />
      </WalletCoreProvider>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExtensionProviders>
      <Component />
    </ExtensionProviders>
  </StrictMode>
)
