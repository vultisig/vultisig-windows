import './App.css'
import './extensions/string'

import { Buffer } from 'buffer'
import { createRoot } from 'react-dom/client'

import App from './App'

// Make sure Buffer is available globally
window.Buffer = Buffer

const root = createRoot(document.getElementById('root')!)

root.render(<App />)
