import { views } from '@clients/extension/src/navigation/views'
import { isPopupView } from '@clients/extension/src/utils/functions'
import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { useProcessAppError } from '@core/ui/errors/hooks/useProcessAppError'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { createGlobalStyle, css } from 'styled-components'

import { NavigationProvider } from '../navigation/NavigationProvider'
import { renderExtensionPage } from './core/render'

const isPopup = isPopupView()

const ExtensionGlobalStyle = createGlobalStyle`
  body {
    min-height: 600px;
    min-width: 400px;
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

  return (
    <ExtensionCoreApp processError={processError}>
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
