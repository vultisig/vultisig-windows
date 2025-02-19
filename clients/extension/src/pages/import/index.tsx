import '@clients/extension/src/styles/index.scss'
import '@clients/extension/src/pages/popup/index.scss'

import ConfigProvider from '@clients/extension/src/components/config-provider'
import i18n from '@clients/extension/src/i18n/config'
import ImportPage from '@clients/extension/src/pages/popup/pages/import'
import routerKeys from '@clients/extension/src/utils/route-keys'
import { getStoredLanguage } from '@clients/extension/src/utils/storage'
import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'

const router = createHashRouter(
  [
    {
      path: routerKeys.root,
      element: <ImportPage />,
    },
    {
      path: '*',
      element: <Navigate to={routerKeys.root} replace />,
    },
  ],
  {
    basename: routerKeys.basePath,
  }
)

const Component = () => {
  const componentDidMount = (): void => {
    getStoredLanguage().then(language => {
      i18n.changeLanguage(language)
    })
  }

  useEffect(componentDidMount, [])

  return (
    <ConfigProvider>
      <RouterProvider router={router} />
    </ConfigProvider>
  )
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Component />
  </StrictMode>
)
