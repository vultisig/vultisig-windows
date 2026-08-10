import { darkTheme } from '@lib/ui/theme/darkTheme'
import { stationTheme } from '@lib/ui/theme/stationTheme'
import { ThemeColor } from '@lib/ui/theme/ThemeColors'
import { ReactElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { ServerStyleSheet, ThemeProvider } from 'styled-components'
import { describe, expect, test } from 'vitest'

import { Button } from '.'

// Values below are read straight off the "Button" component set in the
// Vultisig design system (Web platform, dark theme). They are asserted here so
// the shared Button cannot silently drift away from the spec again.
const styleOf = (ui: ReactElement) => {
  const sheet = new ServerStyleSheet()
  try {
    renderToStaticMarkup(
      sheet.collectStyles(<ThemeProvider theme={darkTheme}>{ui}</ThemeProvider>)
    )
    return sheet.getStyleTags().replace(/\s+/g, '')
  } finally {
    sheet.seal()
  }
}

// The hairline is an inside stroke in the design system, so it ships as an
// inset ring sharing a box with the shadows rather than as a CSS border.
const hairline = 'inset0001pxrgba(255,255,255,0.03)'
const raisedInset = 'inset01px1.9px0rgba(255,255,255,0.24)'
const flatInset = 'inset01px1px0rgba(255,255,255,0.1)'

const colourCases: [ThemeColor, string][] = [
  ['buttonPrimary', '#0b4eff'],
  ['buttonHover', '#1e6ad1'],
  ['buttonSecondary', '#11284a'],
  ['buttonSecondaryHover', '#1d385e'],
  ['buttonNeutral', '#2155df'],
  ['buttonNeutralHover', '#1e6ad1'],
  ['buttonSuccessHover', '#0fbf93'],
  ['buttonBackgroundDisabled', '#0b1a3a'],
  ['buttonTextDisabled', '#718096'],
]

describe('design system colours', () => {
  test.each(colourCases)('%s is %s', (token, hex) => {
    expect(darkTheme.colors[token].toHex()).toBe(hex)
  })

  // Station has no design system entry for this one. It follows that theme's
  // own convention, where hover is lighter and more saturated than the base.
  test('station success hover is lighter than its base', () => {
    expect(stationTheme.colors.buttonSuccessHover.toHex()).toBe('#47f0cb')
    expect(stationTheme.colors.primary.toHex()).toBe('#33e6bf')
  })
})

describe('primary', () => {
  test('md default is a 46px pill with a hairline and the raised inset', () => {
    const css = styleOf(<Button>Get started</Button>)

    expect(css).toContain('height:46px')
    expect(css).toContain('padding-left:24px')
    expect(css).toContain('font-size:14px')
    expect(css).toContain('line-height:18px')
    expect(css).toContain('gap:8px')
    expect(css).toContain(hairline)
    expect(css).toContain(raisedInset)
  })

  test('sm default is a 36px pill with no hairline', () => {
    const css = styleOf(<Button size="sm">Get started</Button>)

    expect(css).toContain('height:36px')
    expect(css).toContain('padding-left:16px')
    expect(css).toContain('font-size:12px')
    expect(css).toContain('line-height:16px')
    expect(css).toContain('gap:4px')
    expect(css).not.toContain(hairline)
  })

  test('md neutral and success sit 4px shorter', () => {
    expect(styleOf(<Button status="neutral">x</Button>)).toContain(
      'height:42px'
    )
    expect(styleOf(<Button status="success">x</Button>)).toContain(
      'height:42px'
    )
  })

  test('success carries no hairline while neutral does', () => {
    expect(styleOf(<Button status="success">x</Button>)).not.toContain(hairline)
    expect(styleOf(<Button status="neutral">x</Button>)).toContain(hairline)
  })

  test('hover drops to the flat inset', () => {
    expect(styleOf(<Button>x</Button>)).toContain(flatInset)
  })

  // Deliberate deviation from the design system, which draws this edge fully
  // opaque. On our background that erases the button's last row and reads as
  // the button shrinking by a pixel on hover.
  test('the bottom edge never goes fully opaque', () => {
    const css = styleOf(<Button>x</Button>)

    expect(css).toContain('inset0-1px0.5px0rgba(15,28,62,0.48)')
    expect(css).not.toContain('rgba(15,28,62,1)')
  })

  test('only the default hierarchy rests on the raised inset', () => {
    expect(styleOf(<Button>x</Button>)).toContain(raisedInset)
    expect(styleOf(<Button status="neutral">x</Button>)).not.toContain(
      raisedInset
    )
    expect(styleOf(<Button status="success">x</Button>)).not.toContain(
      raisedInset
    )
  })

  test('xs is the 32px mini pill', () => {
    const css = styleOf(<Button size="xs">x</Button>)

    expect(css).toContain('height:32px')
    expect(css).toContain('border-radius:30px')
    expect(css).toContain('padding-left:16px')
    expect(css).toContain('font-size:12px')
    expect(css).toContain('line-height:16px')
    expect(css).toContain('gap:4px')
    expect(css).toContain('width:fit-content')
    expect(css).not.toContain(hairline)
  })

  test('disabled is the flat inset with no hairline', () => {
    const css = styleOf(<Button disabled>x</Button>)

    expect(css).toContain(
      darkTheme.colors.buttonBackgroundDisabled.toCssValue()
    )
    expect(css).toContain(flatInset)
    expect(css).not.toContain(hairline)
  })
})

describe('secondary', () => {
  test('rests as a filled pill with a hairline and the flat inset', () => {
    const css = styleOf(<Button kind="secondary">x</Button>)

    expect(css).toContain('height:46px')
    expect(css).toContain(darkTheme.colors.buttonSecondary.toCssValue())
    expect(css).toContain(hairline)
    expect(css).toContain(flatInset)
  })

  test('disabled is transparent behind a 60% neutral border', () => {
    const css = styleOf(
      <Button kind="secondary" disabled>
        x
      </Button>
    )

    expect(css).toContain('background-color:transparent')
    expect(css).toContain(
      darkTheme.colors.buttonNeutral
        .getVariant({ a: () => 0.6 })
        .toCssValue()
        .replace(/\s+/g, '')
    )
  })
})

describe('link', () => {
  test('renders one 26px size for both sm and md', () => {
    const md = styleOf(<Button kind="link">x</Button>)
    const sm = styleOf(
      <Button kind="link" size="sm">
        x
      </Button>
    )

    expect(md).toContain('height:26px')
    expect(sm).toContain('height:26px')
    expect(md).toContain('font-size:14px')
    expect(sm).toContain('font-size:14px')
    expect(md).toContain('padding-left:4px')
  })

  test('hover tints the background instead of recolouring the label', () => {
    const css = styleOf(<Button kind="link">x</Button>)

    expect(css).toContain(darkTheme.colors.buttonLinkHover.toCssValue())
  })
})
