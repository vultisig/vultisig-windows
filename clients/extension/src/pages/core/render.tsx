import { ExtensionQueryClientProvider } from '@core/extension/ExtensionQueryClientProvider'
import { ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

export const renderExtensionPage = (node: ReactNode) => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ExtensionQueryClientProvider>{node}</ExtensionQueryClientProvider>
    </StrictMode>
  )
}
