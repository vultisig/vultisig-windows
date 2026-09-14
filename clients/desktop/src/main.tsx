import '@core/ui/animations/configureRiveRuntime'

import { ensureProtobufTextEncoding } from '@core/ui/protobuf/ensureProtobufTextEncoding'
import { Buffer } from 'buffer'
import { createRoot } from 'react-dom/client'

import App from './App'

// Make sure Buffer is available globally
window.Buffer = Buffer

ensureProtobufTextEncoding()

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
