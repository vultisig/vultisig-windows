import { appPaths } from '@clients/extension/src/navigation'
import ImportFile from '@clients/extension/src/pages/popup/pages/import-file'
import { AppProviders } from '@clients/extension/src/providers/AppProviders'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'

const router = createHashRouter(
  [
    {
      path: appPaths.root,
      element: <ImportFile />,
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
