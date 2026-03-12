import { beforeEach } from 'vitest'

import { chromeMock, resetChromeMock } from './mocks/chrome'

// Install chrome mock globally
;(globalThis as any).chrome = chromeMock

// Provide minimal window/document if not present (node environment)
if (typeof window === 'undefined') {
  const doc = {
    doctype: { name: 'html' },
    documentElement: { nodeName: 'HTML' },
    createElement: () => ({}),
  }
  ;(globalThis as any).window = {
    document: doc,
    location: { pathname: '/', href: 'https://example.com/', origin: 'https://example.com' },
    addEventListener: () => {},
    removeEventListener: () => {},
    postMessage: () => {},
  }
  ;(globalThis as any).document = doc
}

// Reset mocks between tests
beforeEach(() => {
  resetChromeMock()
})
