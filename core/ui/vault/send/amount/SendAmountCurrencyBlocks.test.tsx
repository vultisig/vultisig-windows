// @vitest-environment happy-dom
/**
 * Switching between the asset and fiat fields only changes which one shows:
 * the fiat text drawn for an amount the app set never flows back into it.
 */
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { act, cleanup, render } from '@testing-library/react'
import { createRef, useEffect, useState } from 'react'
import { ThemeProvider } from 'styled-components'
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest'

import type { CurrencyInputMode } from './currencyInputMode'

vi.mock('../state/sendCoin', () => ({
  useCurrentSendCoin: () => ({ chain: 'Ethereum', decimals: 6, ticker: 'ETH' }),
}))
vi.mock('@core/ui/chain/coin/price/queries/useCoinPriceQuery', () => ({
  useCoinPriceQuery: () => ({ data: 0.1 }),
}))
vi.mock('@core/ui/storage/fiatCurrency', () => ({
  useFiatCurrency: () => 'eur',
}))
vi.mock('./AmountInReverseCurrencyDisplay', () => ({
  AmountInReverseCurrencyDisplay: () => null,
}))

import { SendAmountCurrencyBlocks } from './SendAmountCurrencyBlocks'

const state = {
  value: null as bigint | null,
  changes: 0,
  setValue: (_value: bigint | null) => {},
}

type HarnessProps = {
  mode: CurrencyInputMode
  onState: (value: bigint | null) => void
  onSetter: (setValue: (value: bigint | null) => void) => void
}

const Harness = ({ mode, onState, onSetter }: HarnessProps) => {
  const [value, setValue] = useState<bigint | null>(null)

  useEffect(() => onState(value), [onState, value])
  useEffect(() => onSetter(setValue), [onSetter])

  return (
    <ThemeProvider theme={darkTheme}>
      <SendAmountCurrencyBlocks
        ref={createRef<HTMLDivElement>()}
        mode={mode}
        inputProps={{ isWarning: false, placeholder: '0', disabled: false }}
        value={value}
        onChange={next => {
          state.changes += 1
          setValue(next)
        }}
      />
    </ThemeProvider>
  )
}

const harness = (mode: CurrencyInputMode) => (
  <Harness
    mode={mode}
    onState={value => {
      state.value = value
    }}
    onSetter={setValue => {
      state.setValue = setValue
    }}
  />
)

const fieldText = (container: HTMLElement, mode: CurrencyInputMode) =>
  container.querySelector<HTMLInputElement>(
    `[data-currency-block="${mode}"] input`
  )?.value

beforeAll(() => {
  // happy-dom has no FontFaceSet; the amount line listens for web fonts.
  Object.defineProperty(document, 'fonts', {
    value: new EventTarget(),
    configurable: true,
  })
})

afterEach(() => {
  cleanup()
  state.changes = 0
})

describe('SendAmountCurrencyBlocks', () => {
  it('leaves a Max amount untouched when switching to fiat and back', () => {
    const { container, rerender } = render(harness('base'))

    act(() => state.setValue(123_400_000n))
    rerender(harness('fiat'))

    expect(fieldText(container, 'fiat')).toBe('12.34')
    expect(state.value).toBe(123_400_000n)

    rerender(harness('base'))

    expect(fieldText(container, 'base')).toBe('123.4')
    expect(state.value).toBe(123_400_000n)
    expect(state.changes).toBe(0)
  })
})
