import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/popup/index.scss'

import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { router } from '../../navigation/routes'
import { AppProviders } from '../../providers/AppProviders'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppProviders>
      <RouterProvider router={router} />
    </AppProviders>
  </StrictMode>
)
