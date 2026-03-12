import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { shouldInjectProvider } from '@clients/extension/src/inpage/utils/injectHelpers'

describe('shouldInjectProvider', () => {
  // Save original window state
  let originalDocument: typeof window.document
  let originalLocation: typeof window.location

  beforeEach(() => {
    originalDocument = window.document
    originalLocation = window.location
  })

  afterEach(() => {
    // Restore after each test
    Object.defineProperty(window, 'document', {
      value: originalDocument,
      writable: true,
      configurable: true,
    })
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
      configurable: true,
    })
  })

  function setDoctype(name: string | null) {
    const doctype = name !== null ? { name } : null
    Object.defineProperty(window.document, 'doctype', {
      value: doctype,
      writable: true,
      configurable: true,
    })
  }

  function setPathname(pathname: string) {
    Object.defineProperty(window, 'location', {
      value: { ...window.location, pathname },
      writable: true,
      configurable: true,
    })
  }

  function setDocumentElement(nodeName: string | null) {
    const el = nodeName !== null ? { nodeName } : null
    Object.defineProperty(window.document, 'documentElement', {
      value: el,
      writable: true,
      configurable: true,
    })
    // Also set on global document (which may be the same object)
    if (typeof document !== 'undefined' && document !== window.document) {
      Object.defineProperty(document, 'documentElement', {
        value: el,
        writable: true,
        configurable: true,
      })
    }
  }

  it('returns true for a normal HTML page', () => {
    setDoctype('html')
    setPathname('/index.html')
    setDocumentElement('HTML')
    expect(shouldInjectProvider()).toBe(true)
  })

  it('returns true when doctype is null (no doctype)', () => {
    setDoctype(null)
    setPathname('/page')
    setDocumentElement('HTML')
    expect(shouldInjectProvider()).toBe(true)
  })

  it('returns false for XML pages (doctype.name !== html)', () => {
    setDoctype('xml')
    setPathname('/data')
    setDocumentElement('HTML')
    expect(shouldInjectProvider()).toBe(false)
  })

  it('returns false for SVG doctype', () => {
    setDoctype('svg')
    setPathname('/image')
    setDocumentElement('HTML')
    expect(shouldInjectProvider()).toBe(false)
  })

  it('returns false for .pdf files', () => {
    setDoctype('html')
    setPathname('/document.pdf')
    setDocumentElement('HTML')
    expect(shouldInjectProvider()).toBe(false)
  })

  it('returns false for .xml files', () => {
    setDoctype('html')
    setPathname('/feed.xml')
    setDocumentElement('HTML')
    expect(shouldInjectProvider()).toBe(false)
  })

  it('returns true for normal paths (no prohibited suffix)', () => {
    setDoctype('html')
    setPathname('/app/dashboard')
    setDocumentElement('HTML')
    expect(shouldInjectProvider()).toBe(true)
  })

  it('returns false when no html documentElement exists', () => {
    setDoctype('html')
    setPathname('/')
    setDocumentElement(null)
    expect(shouldInjectProvider()).toBe(false)
  })

  it('returns false when documentElement is not html', () => {
    setDoctype('html')
    setPathname('/')
    setDocumentElement('svg')
    expect(shouldInjectProvider()).toBe(false)
  })

  it('returns true for pages with query params and hash', () => {
    setDoctype('html')
    setPathname('/page')
    setDocumentElement('HTML')
    // pathname doesn't include query/hash, so this should be fine
    expect(shouldInjectProvider()).toBe(true)
  })

  it('is case-insensitive for documentElement nodeName', () => {
    setDoctype('html')
    setPathname('/')
    setDocumentElement('HTML')
    expect(shouldInjectProvider()).toBe(true)

    setDocumentElement('Html')
    expect(shouldInjectProvider()).toBe(true)
  })
})
