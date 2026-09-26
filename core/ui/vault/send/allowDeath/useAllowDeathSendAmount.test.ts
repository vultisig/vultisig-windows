import { Chain } from '@vultisig/core-chain/Chain'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useAllowDeathSendAmount } from './useAllowDeathSendAmount'

const mocks = vi.hoisted(() => ({
  allowDeath: vi.fn(),
  amount: vi.fn(),
  balance: vi.fn(),
  fee: vi.fn(),
}))

vi.mock('../state/sendCoin', () => ({
  useCurrentSendCoin: () => ({
    chain: Chain.Bittensor,
    address: '5F3sa2TJAWMqDhXG6jhV4N8ko9SxwGy8TpaNS1repo5EYjQX',
    ticker: 'TAO',
    decimals: 9,
  }),
}))
vi.mock('./useSendAllowDeath', () => ({ useSendAllowDeath: mocks.allowDeath }))
vi.mock('../state/amount', () => ({ useSendAmount: mocks.amount }))
vi.mock('../queries/useSendBalanceQuery', () => ({
  useSendBalanceQuery: mocks.balance,
}))
vi.mock('../queries/useSendFeeEstimateQuery', () => ({
  useSendFeeEstimateQuery: mocks.fee,
}))

const balance = 1_000_000_000n
const fee = 200_000n

type HarnessResult = {
  target: string | null
  isSyncing: boolean
}

const isHarnessResult = (value: unknown): value is HarnessResult =>
  typeof value === 'object' &&
  value !== null &&
  'target' in value &&
  (value.target === null || typeof value.target === 'string') &&
  'isSyncing' in value &&
  typeof value.isSyncing === 'boolean'

const read = () => {
  const Harness = () => {
    const { target, isSyncing } = useAllowDeathSendAmount()
    return createElement(
      'script',
      { type: 'application/json' },
      JSON.stringify({
        target: target === null ? null : target.toString(),
        isSyncing,
      })
    )
  }
  const html = renderToStaticMarkup(createElement(Harness))
  const parsed: unknown = JSON.parse(
    html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'))
  )
  if (!isHarnessResult(parsed)) {
    throw new Error('Unexpected harness output')
  }
  return {
    target: parsed.target === null ? null : BigInt(parsed.target),
    isSyncing: parsed.isSyncing,
  }
}

describe('useAllowDeathSendAmount', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.allowDeath.mockReturnValue({ isEnabled: true })
    mocks.amount.mockReturnValue([null, vi.fn()])
    mocks.balance.mockReturnValue({ data: balance })
    mocks.fee.mockReturnValue({ data: fee, isPlaceholderData: false })
  })

  it('targets the whole balance less the fee, keeping no existential deposit', () => {
    expect(read()).toEqual({ target: balance - fee, isSyncing: true })
  })

  it('is settled once the amount holds the target', () => {
    mocks.amount.mockReturnValue([balance - fee, vi.fn()])

    expect(read()).toEqual({ target: balance - fee, isSyncing: false })
  })

  it('waits for the allow-death fee instead of the keep-alive placeholder', () => {
    mocks.fee.mockReturnValue({ data: fee, isPlaceholderData: true })

    expect(read()).toEqual({ target: null, isSyncing: true })
  })

  it('waits while the balance is unknown', () => {
    mocks.balance.mockReturnValue({ data: undefined })

    expect(read()).toEqual({ target: null, isSyncing: true })
  })

  it('does not hold the form back when the fee swallows the balance', () => {
    mocks.fee.mockReturnValue({ data: balance, isPlaceholderData: false })

    expect(read()).toEqual({ target: 0n, isSyncing: false })
  })

  it('has no target and never syncs while the option is off', () => {
    mocks.allowDeath.mockReturnValue({ isEnabled: false })
    mocks.amount.mockReturnValue([5n, vi.fn()])

    expect(read()).toEqual({ target: null, isSyncing: false })
  })
})
