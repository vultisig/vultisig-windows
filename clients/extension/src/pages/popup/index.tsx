import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/popup/index.scss'

import ConfigProvider from '@clients/extension/src/components/config-provider'
import Routing from '@clients/extension/src/pages/popup/routes'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { ExtensionProviders } from '../../state/ExtensionProviders'

const Component = () => {
  return (
    <ConfigProvider>
      <Routing />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExtensionProviders>
      <WalletCoreProvider>
        <Component />
      </WalletCoreProvider>
    </ExtensionProviders>
  </StrictMode>
)
