// @vitest-environment happy-dom
/**
 * In a locale that writes a decimal comma the amount fields show the comma,
 * so the number on screen is the one that gets signed; parsing what is shown
 * gives back the stored amount. A dot locale behaves as before.
 */
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { DecimalSeparator } from './normalizeDecimalSeparator'

const locale = vi.hoisted(() => ({ separator: '.' as DecimalSeparator }))

vi.mock('./normalizeDecimalSeparator', async importOriginal => ({
  ...(await importOriginal<typeof import('./normalizeDecimalSeparator')>()),
  getDeviceDecimalSeparator: () => locale.separator,
}))

import {
  BaseSendAmountInput,
  parseSendAmountInput,
} from './BaseSendAmountInput'
import { FiatSendAmountInput } from './FiatSendAmountInput'

const decimals = 6

const stored = { value: null as bigint | null }
const control = { setStored: (_value: bigint | null) => {} }

type AmountHarnessProps = {
  field: 'base' | 'fiat'
  price: number
  onStored: (value: bigint | null) => void
  onSetter: (setValue: (value: bigint | null) => void) => void
}

const AmountHarness = ({
  field,
  price,
  onStored,
  onSetter,
}: AmountHarnessProps) => {
  const [value, setValue] = useState<bigint | null>(null)

  useEffect(() => onStored(value), [onStored, value])
  useEffect(() => onSetter(setValue), [onSetter])

  const props = {
    value,
    onChange: setValue,
    decimals,
    placeholder: '0',
  }

  return (
    <ThemeProvider theme={darkTheme}>
      {field === 'base' ? (
        <BaseSendAmountInput {...props} ticker="ETH" />
      ) : (
        <FiatSendAmountInput {...props} price={price} currency="EUR" />
      )}
    </ThemeProvider>
  )
}

const setStored = (value: bigint | null) => control.setStored(value)

const renderField = (field: 'base' | 'fiat', price = 2) => {
  render(
    <AmountHarness
      field={field}
      price={price}
      onStored={value => {
        stored.value = value
      }}
      onSetter={setValue => {
        control.setStored = setValue
      }}
    />
  )

  return screen.getByRole('textbox') as HTMLInputElement
}

const shownText = (input: HTMLInputElement) => input.value

beforeAll(() => {
  // happy-dom has no FontFaceSet; the amount line listens for web fonts.
  Object.defineProperty(document, 'fonts', {
    value: new EventTarget(),
    configurable: true,
  })
})

afterEach(() => {
  cleanup()
  locale.separator = '.'
})

const typedCases: [DecimalSeparator, string, string, bigint | null][] = [
  [',', '1.000', '1,000', 1_000_000n],
  [',', '1,000', '1,000', 1_000_000n],
  [',', '1,5', '1,5', 1_500_000n],
  [',', '1.5', '1,5', 1_500_000n],
  ['.', '1.000', '1.000', 1_000_000n],
  ['.', '1,000', '', null],
  ['.', '1,5', '', null],
  ['.', '1.5', '1.5', 1_500_000n],
]

describe('asset amount field', () => {
  it.each(typedCases)(
    'in a "%s" locale shows typed %s as %s and stores %s',
    (separator, typed, shown, amount) => {
      locale.separator = separator
      const input = renderField('base')

      fireEvent.change(input, { target: { value: typed } })

      expect(shownText(input)).toBe(shown)
      expect(stored.value).toBe(amount)
    }
  )

  it.each(typedCases)(
    'in a "%s" locale shows pasted %s as %s and stores %s',
    (separator, pasted, shown, amount) => {
      locale.separator = separator
      const input = renderField('base')

      fireEvent.paste(input, { clipboardData: { getData: () => pasted } })

      expect(shownText(input)).toBe(shown)
      expect(stored.value).toBe(amount)
    }
  )

  it.each<[DecimalSeparator, bigint, string]>([
    [',', 1_234_567n, '1,234567'],
    [',', 2_000_000n, '2'],
    ['.', 1_234_567n, '1.234567'],
  ])(
    'in a "%s" locale shows the set amount %s (Max, a chip, a coin switch) as %s',
    (separator, amount, shown) => {
      locale.separator = separator
      const input = renderField('base')

      act(() => setStored(amount))

      expect(shownText(input)).toBe(shown)
      expect(
        parseSendAmountInput({
          value: shownText(input),
          decimals,
          decimalSeparator: separator,
        })
      ).toEqual(expect.objectContaining({ chainAmount: amount }))
    }
  )

  it('keeps the caret where a swapped separator was typed', () => {
    locale.separator = ','
    const input = renderField('base')
    act(() => setStored(15_000_000n))
    input.focus()

    fireEvent.change(input, { target: { value: '1.5', selectionStart: 2 } })

    expect(shownText(input)).toBe('1,5')
    expect(input.selectionStart).toBe(2)
  })
})

describe('fiat amount field', () => {
  it.each<[DecimalSeparator, string, string]>([
    [',', '1.5', '1,5'],
    [',', '1,5', '1,5'],
    ['.', '1.5', '1.5'],
  ])('in a "%s" locale shows typed %s as %s', (separator, typed, shown) => {
    locale.separator = separator
    const input = renderField('fiat')

    fireEvent.change(input, { target: { value: typed } })

    expect(shownText(input)).toBe(shown)
    expect(stored.value).toBe(750_000n)
  })

  it('shows a set amount whose fiat value is a long float at two decimals', () => {
    const input = renderField('fiat', 0.1)

    act(() => setStored(123_400_000n))

    expect(shownText(input)).toBe('12.34')
    expect(stored.value).toBe(123_400_000n)
  })

  it('keeps typed fiat text exactly as typed', () => {
    const input = renderField('fiat')

    fireEvent.change(input, { target: { value: '12.3456' } })

    expect(shownText(input)).toBe('12.3456')
  })

  it('refuses a comma in a dot locale', () => {
    const input = renderField('fiat')

    fireEvent.change(input, { target: { value: '1,5' } })

    expect(shownText(input)).toBe('')
    expect(stored.value).toBeNull()
  })

  it.each<[DecimalSeparator, string]>([
    [',', '2,50'],
    ['.', '2.50'],
  ])(
    'in a "%s" locale shows the fiat value of a set amount as %s',
    (separator, shown) => {
      locale.separator = separator
      const input = renderField('fiat')

      act(() => setStored(1_250_000n))

      expect(shownText(input)).toBe(shown)
    }
  )
})
