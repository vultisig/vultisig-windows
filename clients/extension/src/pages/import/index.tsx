import { appPaths } from '@clients/extension/src/navigation'
import ImportQRPage from '@clients/extension/src/pages/popup/pages/import-qr'
import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'

const router = createHashRouter(
  [
    {
      path: appPaths.root,
      element: <ImportQRPage />,
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
