import { Chain } from '@vultisig/core-chain/Chain'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSendAllowDeath } from './useSendAllowDeath'

const mocks = vi.hoisted(() => ({
  coin: vi.fn(),
  preference: vi.fn(),
}))

vi.mock('../state/sendCoin', () => ({ useCurrentSendCoin: mocks.coin }))
vi.mock('../state/allowDeath', () => ({
  useSendAllowDeathPreference: mocks.preference,
}))

const dot = {
  chain: Chain.Polkadot,
  address: '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5',
  ticker: 'DOT',
  decimals: 10,
}

type HarnessResult = {
  isAvailable: boolean
  isEnabled: boolean
}

const isHarnessResult = (value: unknown): value is HarnessResult =>
  typeof value === 'object' &&
  value !== null &&
  'isAvailable' in value &&
  typeof value.isAvailable === 'boolean' &&
  'isEnabled' in value &&
  typeof value.isEnabled === 'boolean'

const read = (): HarnessResult => {
  const Harness = () => {
    const { isAvailable, isEnabled } = useSendAllowDeath()
    return createElement(
      'script',
      { type: 'application/json' },
      JSON.stringify({ isAvailable, isEnabled })
    )
  }
  const html = renderToStaticMarkup(createElement(Harness))
  const parsed: unknown = JSON.parse(
    html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'))
  )
  if (!isHarnessResult(parsed)) {
    throw new Error('Unexpected harness output')
  }
  return parsed
}

describe('useSendAllowDeath', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.coin.mockReturnValue(dot)
    mocks.preference.mockReturnValue([false, vi.fn()])
  })

  it.each([
    ['native DOT', dot],
    ['native TAO', { ...dot, chain: Chain.Bittensor, ticker: 'TAO' }],
  ])('is available and off by default for %s', (_, coin) => {
    mocks.coin.mockReturnValue(coin)

    expect(read()).toEqual({ isAvailable: true, isEnabled: false })
  })

  it('follows the user once they turn it on', () => {
    mocks.preference.mockReturnValue([true, vi.fn()])

    expect(read()).toEqual({ isAvailable: true, isEnabled: true })
  })

  it.each([
    ['a Polkadot Asset Hub token', { ...dot, id: '1984', ticker: 'USDT' }],
    ['another chain', { ...dot, chain: Chain.Ethereum, ticker: 'ETH' }],
  ])(
    'is unavailable and never enabled for %s, whatever the preference',
    (_, coin) => {
      mocks.coin.mockReturnValue(coin)
      mocks.preference.mockReturnValue([true, vi.fn()])

      expect(read()).toEqual({ isAvailable: false, isEnabled: false })
    }
  )
})
