// @vitest-environment happy-dom
/**
 * Guards https://github.com/vultisig/vultisig-windows/issues/4933: while the
 * entry is being verified the cells are disabled, which drops keyboard focus.
 * When they come back the user must be able to keep typing without clicking.
 */
import { MultiCharacterInput } from '@lib/ui/inputs/MultiCharacterInput'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ThemeProvider } from '@lib/ui/theme/ThemeProvider'
import { render } from '@testing-library/react'
import { ReactNode } from 'react'
import { describe, expect, it, vi } from 'vitest'

// The loading spinner is a Rive animation that fetches its runtime on import.
vi.mock('@lib/ui/loaders/Spinner', () => ({ Spinner: () => null }))

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ children }: { children?: ReactNode }) => children ?? null,
}))

const length = 6

const renderInput = (props: {
  value: string | null
  validation: 'idle' | 'loading' | 'invalid' | 'valid'
}) =>
  render(
    <ThemeProvider theme={darkTheme}>
      <MultiCharacterInput
        autoFocusFirst={false}
        includePasteButton={false}
        length={length}
        onChange={() => {}}
        {...props}
      />
    </ThemeProvider>
  )

const getCells = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('input'))

describe('MultiCharacterInput focus after verification', () => {
  it('focuses the first cell when the entry was cleared on failure', () => {
    const { container, rerender } = renderInput({
      value: '123456',
      validation: 'loading',
    })
    expect(document.activeElement).not.toBe(getCells(container)[0])

    rerender(
      <ThemeProvider theme={darkTheme}>
        <MultiCharacterInput
          autoFocusFirst={false}
          includePasteButton={false}
          length={length}
          onChange={() => {}}
          value={null}
          validation="invalid"
        />
      </ThemeProvider>
    )

    expect(document.activeElement).toBe(getCells(container)[0])
  })

  it('focuses the last cell when the rejected entry is kept', () => {
    const { container, rerender } = renderInput({
      value: '123456',
      validation: 'loading',
    })

    rerender(
      <ThemeProvider theme={darkTheme}>
        <MultiCharacterInput
          autoFocusFirst={false}
          includePasteButton={false}
          length={length}
          onChange={() => {}}
          value="123456"
          validation="invalid"
        />
      </ThemeProvider>
    )

    expect(document.activeElement).toBe(getCells(container)[length - 1])
  })

  it('does not move focus while the cells stay enabled', () => {
    const { container, rerender } = renderInput({
      value: null,
      validation: 'idle',
    })
    const [, second] = getCells(container)
    second.focus()

    rerender(
      <ThemeProvider theme={darkTheme}>
        <MultiCharacterInput
          autoFocusFirst={false}
          includePasteButton={false}
          length={length}
          onChange={() => {}}
          value="1"
          validation="idle"
        />
      </ThemeProvider>
    )

    expect(document.activeElement).toBe(second)
  })
})
