import { NavigationProvider } from '@clients/extension/src/navigation/NavigationProvider'
import { views } from '@clients/extension/src/navigation/views'
import { renderExtensionPage } from '@clients/extension/src/pages/core/render'
import { isPopupView } from '@clients/extension/src/utils/functions'
import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { useProcessAppError } from '@core/ui/errors/hooks/useProcessAppError'
import { initialCoreView } from '@core/ui/navigation/CoreView'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useNavigateBack } from '@lib/ui/navigation/hooks/useNavigateBack'
import { createGlobalStyle, css } from 'styled-components'

const isPopup = isPopupView()

const ExtensionGlobalStyle = createGlobalStyle`
  body {
    min-height: 600px;
    min-width: 480px;
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
  const navigate = useNavigate()

  return (
    <ExtensionCoreApp
      processError={processError}
      goBack={goBack}
      goHome={() => navigate(initialCoreView)}
    >
      <ActiveView views={views} />
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
