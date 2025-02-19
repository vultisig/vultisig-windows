import '../../styles/index.scss'
import '../../pages/popup/index.scss'

import { StrictMode, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { createHashRouter, Navigate, RouterProvider } from 'react-router-dom'

import ConfigProvider from '../../components/config-provider'
import i18n from '../../i18n/config'
import ImportPage from '../../pages/popup/pages/import'
import routerKeys from '../../utils/route-keys'
import { getStoredLanguage } from '../../utils/storage'

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
