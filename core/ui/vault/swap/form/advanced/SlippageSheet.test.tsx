// @vitest-environment happy-dom
/**
 * The custom slippage field stored whatever was typed, so a comma left `0,5`
 * on screen while the swap fell back to Auto, and repeated commas piled up as
 * `0,,,,,` (#5289). These tests type one key at a time, the way the bug was
 * hit, rather than handing the parser a finished string.
 */
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { fireEvent, render, screen } from '@testing-library/react'
import { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('./AdvancedSheet', () => ({
  AdvancedSheet: ({
    children,
    onConfirm,
  }: {
    children: ReactNode
    onConfirm: () => void
  }) => (
    <div>
      {children}
      <button type="button" onClick={onConfirm}>
        confirm
      </button>
    </div>
  ),
}))

import { defaultSlippage } from './slippage'
import { SlippageSheet } from './SlippageSheet'

const renderSheet = () => {
  const onChange = vi.fn()
  render(
    <ThemeProvider theme={darkTheme}>
      <SlippageSheet
        value={defaultSlippage}
        onChange={onChange}
        onClose={() => {}}
      />
    </ThemeProvider>
  )
  const input = screen.getByPlaceholderText<HTMLInputElement>('0.00')
  const type = (keys: string) => {
    for (const key of keys) {
      fireEvent.change(input, { target: { value: input.value + key } })
    }
  }
  return { input, type, onChange }
}

describe('SlippageSheet custom input', () => {
  it('reads a typed comma as the decimal point and applies 0.5%', () => {
    const { input, type, onChange } = renderSheet()

    type('0,5')
    expect(input.value).toBe('0.5')

    fireEvent.click(screen.getByRole('button', { name: 'confirm' }))
    expect(onChange).toHaveBeenCalledWith({
      mode: 'custom',
      customPercent: 0.5,
    })
  })

  it('never lets repeated separators pile up in the field', () => {
    const { input, type } = renderSheet()

    type('0,,,,,')
    expect(input.value).toBe('0.')
  })

  it('refuses a second separator', () => {
    const { input, type } = renderSheet()

    type('1,2,')
    expect(input.value).toBe('1.2')
  })
})
