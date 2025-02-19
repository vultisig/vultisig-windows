import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/popup/index.scss'

import ConfigProvider from '@clients/extension/src/components/config-provider'
import i18n from '@clients/extension/src/i18n/config'
import Routing from '@clients/extension/src/pages/popup/routes'
import { getStoredLanguage } from '@clients/extension/src/utils/storage'
import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

const Component = () => {
  const componentDidMount = (): void => {
    getStoredLanguage().then(language => {
      i18n.changeLanguage(language)
    })
  }

  useEffect(componentDidMount, [])

  return (
    <ConfigProvider>
      <Routing />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Component />
  </StrictMode>
)
