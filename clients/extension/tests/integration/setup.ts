import { beforeEach } from 'vitest'

import { chromeMock, resetChromeMock } from '../unit/mocks/chrome'

// Install chrome mock globally (happy-dom already provides window/document)
;(globalThis as any).chrome = chromeMock

beforeEach(() => {
  resetChromeMock()
})
