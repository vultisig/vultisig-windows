import { ExtensionCoreApp } from '@core/extension/ExtensionCoreApp'
import { ExtensionQueryClientProvider } from '@core/extension/ExtensionQueryClientProvider'
import { PopupView } from '@core/inpage-provider/popup/view'
import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ExtensionQueryClientProvider>
      <ExtensionCoreApp>
        <PopupView />
      </ExtensionCoreApp>
    </ExtensionQueryClientProvider>
  </StrictMode>
)
