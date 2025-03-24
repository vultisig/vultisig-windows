import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/popup/index.scss'

import ConfigProvider from '@clients/extension/src/components/config-provider'
import Routing from '@clients/extension/src/pages/popup/routes'
import { WalletCoreProvider } from '@core/ui/chain/providers/WalletCoreProvider'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

import { I18nProvider } from '../../i18n/I18nProvider'

const Component = () => {
  return (
    <ConfigProvider>
      <I18nProvider>
        <Routing />
      </I18nProvider>
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <I18nProvider>
      <WalletCoreProvider>
        <Component />
      </WalletCoreProvider>
    </I18nProvider>
  </StrictMode>
)
