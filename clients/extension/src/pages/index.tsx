import '../polyfills/installFirefoxProcessGlobal'

import { NavigationProvider } from '@clients/extension/src/navigation/NavigationProvider'
import { views } from '@clients/extension/src/navigation/views'
import { ExtensionNotificationManager } from '@clients/extension/src/notifications/ExtensionNotificationManager'
import { renderExtensionPage } from '@clients/extension/src/pages/core/render'
import { isPopupView } from '@clients/extension/src/utils/functions'
import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { useProcessAppError } from '@core/ui/errors/hooks/useProcessAppError'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import {
  useNavigateBack,
  usePopNavigationHistory,
} from '@lib/ui/navigation/hooks/useNavigateBack'
import { createGlobalStyle, css } from 'styled-components'

const isPopup = isPopupView()
const popupWidth = 480
const popupHeight = 600

const ExtensionGlobalStyle = createGlobalStyle`
  ${
    isPopup &&
    css`
      html,
      body,
      #root {
        width: ${popupWidth}px;
        height: ${popupHeight}px;
        min-width: ${popupWidth}px;
        min-height: ${popupHeight}px;
        max-width: ${popupWidth}px;
        max-height: ${popupHeight}px;
        overflow: hidden;
      }
    `
  }

  body {
    min-height: ${isPopup ? `${popupHeight}px` : '600px'};
    min-width: ${isPopup ? `${popupWidth}px` : 'min(480px, 100vw)'};
    overflow: hidden;

    ${
      !isPopup &&
      css`
        margin: 0 auto;
        max-width: 1024px;
        width: 100%;
      `
    }
  }
`

const App = () => {
  const processError = useProcessAppError()
  const goBack = useNavigateBack()
  const popNavigationHistory = usePopNavigationHistory()
  const navigate = useNavigate()

  return (
    <ExtensionCoreApp
      processError={processError}
      goBack={goBack}
      goHome={() => navigate(initialCoreView)}
      popNavigationHistory={popNavigationHistory}
    >
      <ActiveView views={views} />
      <ExtensionNotificationManager />
    </ExtensionCoreApp>
  )
}

renderExtensionPage(
  <>
    <ExtensionGlobalStyle />
    <NavigationProvider>
      <App />
    </NavigationProvider>
  </>
)
