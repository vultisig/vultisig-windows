import '../../styles/index.scss'
import '../../pages/popup/index.scss'

import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'

import ConfigProvider from '../../components/config-provider'
import i18n from '../../i18n/config'
import Routing from '../../pages/popup/routes'
import { getStoredLanguage } from '../../utils/storage'

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
