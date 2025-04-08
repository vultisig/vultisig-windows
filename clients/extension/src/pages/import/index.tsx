import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/popup/index.scss'

import { appPaths } from '@clients/extension/src/navigation'
import ImportPage from '@clients/extension/src/pages/popup/pages/import'
import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'

const router = createHashRouter(
  [
    {
      path: appPaths.root,
      element: <ImportPage />,
    },
    {
      path: '*',
      element: <Navigate to={appPaths.root} replace />,
    },
  ],
  {
    basename: appPaths.root,
  }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
)
