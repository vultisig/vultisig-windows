import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/popup/index.scss'

import ConfigProvider from '@clients/extension/src/components/config-provider'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'

import { ExtensionProviders } from '../../state/ExtensionProviders'
import { router } from './routes'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExtensionProviders>
      <WalletCoreProvider>
        <ConfigProvider>
          <RouterProvider router={router} />
        </ConfigProvider>
      </WalletCoreProvider>
    </ExtensionProviders>
  </StrictMode>
)
