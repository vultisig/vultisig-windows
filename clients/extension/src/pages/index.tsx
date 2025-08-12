import { views } from '@clients/extension/src/navigation/views'
import { isPopupView } from '@clients/extension/src/utils/functions'
import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { ExtensionQueryClientProvider } from '@core/extension/ExtensionQueryClientProvider'
import { ActiveView } from '@lib/ui/navigation/ActiveView'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { createGlobalStyle, css } from 'styled-components'

import { NavigationProvider } from '../navigation/NavigationProvider'

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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExtensionGlobalStyle />
    <ExtensionQueryClientProvider>
      <NavigationProvider>
        <ExtensionCoreApp>
          <ActiveView views={views} />
        </ExtensionCoreApp>
      </NavigationProvider>
    </ExtensionQueryClientProvider>
  </StrictMode>
)
