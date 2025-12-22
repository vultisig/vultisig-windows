import React from 'react'
import { renderToString } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'
import { describe, expect, it } from 'vitest'

import { FitPageContent, pageBottomInsetVar, PageContent } from './PageContent'

describe('PageContent bottom inset', () => {
  it('includes page bottom inset var in PageContent styles', () => {
    const sheet = new ServerStyleSheet()

    try {
      renderToString(sheet.collectStyles(<PageContent />))
      const css = sheet.getStyleTags()

      expect(css).toContain(pageBottomInsetVar)
      expect(css).toContain('env(safe-area-inset-bottom)')
    } finally {
      sheet.seal()
    }
  })

  it('includes page bottom inset var in FitPageContent styles', () => {
    const sheet = new ServerStyleSheet()

    try {
      renderToString(sheet.collectStyles(<FitPageContent />))
      const css = sheet.getStyleTags()

      expect(css).toContain(pageBottomInsetVar)
      expect(css).toContain('env(safe-area-inset-bottom)')
    } finally {
      sheet.seal()
    }
  })
})
