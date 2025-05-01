import ImportQRPage from '@clients/extension/src/pages/popup/pages/import-qr'
import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { corePaths } from '@core/ui/navigation'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'

const router = createHashRouter(
  [
    {
      path: corePaths.vault,
      element: <ImportQRPage />,
    },
    {
      path: '*',
      element: <Navigate to={corePaths.vault} replace />,
    },
  ],
  {
    basename: corePaths.vault,
  }
)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
)
