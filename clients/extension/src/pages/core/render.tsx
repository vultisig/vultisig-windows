import { ExtensionQueryClientProvider } from '@core/extension/ExtensionQueryClientProvider'
import { ensureProtobufTextEncoding } from '@core/ui/protobuf/ensureProtobufTextEncoding'
import { ReactNode, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

/**
 * Mounts an extension page. Every page that can start a keysign goes through
 * here, so this is also where the protobuf text-encoding guard runs before any
 * page code touches the SDK.
 */
export const renderExtensionPage = (node: ReactNode) => {
  ensureProtobufTextEncoding()

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <ExtensionQueryClientProvider>{node}</ExtensionQueryClientProvider>
    </StrictMode>
  )
}
