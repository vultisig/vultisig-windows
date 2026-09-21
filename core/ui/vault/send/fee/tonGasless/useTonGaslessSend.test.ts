import { Chain } from '@vultisig/core-chain/Chain'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useTonGaslessSend } from './useTonGaslessSend'

const relay =
  '0:7ae5056c3fd9406f9bbbe7c7089cd4c40801d9075486cbedb7ce12df119eacf1'
const usdt = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'

const mocks = vi.hoisted(() => ({
  coin: vi.fn(),
  walletVersion: vi.fn(),
  preference: vi.fn(),
  config: vi.fn(),
  nativeBalance: vi.fn(),
}))

vi.mock('../../state/sendCoin', () => ({ useCurrentSendCoin: mocks.coin }))
vi.mock('@core/ui/storage/tonW5Enabled', () => ({
  useTonWalletVersion: mocks.walletVersion,
}))
vi.mock('../../state/tonGasless', () => ({
  useSendTonGaslessPreference: mocks.preference,
}))
vi.mock('@core/ui/chain/ton/gasless/queries/useTonGaslessConfigQuery', () => ({
  useTonGaslessConfigQuery: mocks.config,
}))
vi.mock('../../queries/useSendBalanceQuery', () => ({
  useSendBalanceQuery: mocks.nativeBalance,
}))

const usdtCoin = {
  chain: Chain.Ton,
  id: usdt,
  address: 'UQCvaZohosTA0ak9ZFMs-cvL1JrXqogqJH8sI2uO6k8clJpn',
  ticker: 'USDT',
  decimals: 6,
}

const relayConfig = { relayAddress: relay, gasJettonMasters: [relay, usdt] }

type HarnessResult = {
  isAvailable: boolean
  isEnabled: boolean
  isPending: boolean
}

const isHarnessResult = (value: unknown): value is HarnessResult =>
  typeof value === 'object' &&
  value !== null &&
  'isAvailable' in value &&
  typeof value.isAvailable === 'boolean' &&
  'isEnabled' in value &&
  typeof value.isEnabled === 'boolean' &&
  'isPending' in value &&
  typeof value.isPending === 'boolean'

const read = (): HarnessResult => {
  const Harness = () => {
    const { isAvailable, isEnabled, isPending } = useTonGaslessSend()
    return createElement(
      'script',
      { type: 'application/json' },
      JSON.stringify({ isAvailable, isEnabled, isPending })
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

describe('useTonGaslessSend', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.coin.mockReturnValue(usdtCoin)
    mocks.walletVersion.mockReturnValue('v5r1')
    mocks.preference.mockReturnValue([undefined, vi.fn()])
    mocks.config.mockReturnValue({ data: relayConfig, isPending: false })
    mocks.nativeBalance.mockReturnValue({ data: 0n })
  })

  it('is available for a relay-listed jetton on a W5 account', () => {
    expect(read()).toMatchObject({ isAvailable: true, isPending: false })
  })

  it('defaults to on when the account cannot pay a direct send in TON', () => {
    expect(read().isEnabled).toBe(true)
  })

  it('defaults to off when the account holds enough TON for a direct send', () => {
    mocks.nativeBalance.mockReturnValue({ data: 1_000_000_000n })

    expect(read()).toMatchObject({ isAvailable: true, isEnabled: false })
  })

  it('stays off, not on, while the TON balance is still unknown', () => {
    mocks.nativeBalance.mockReturnValue({ data: undefined })

    expect(read().isEnabled).toBe(false)
  })

  it('follows the user once they have touched the switch', () => {
    mocks.nativeBalance.mockReturnValue({ data: 1_000_000_000n })
    mocks.preference.mockReturnValue([true, vi.fn()])
    expect(read().isEnabled).toBe(true)

    mocks.nativeBalance.mockReturnValue({ data: 0n })
    mocks.preference.mockReturnValue([false, vi.fn()])
    expect(read().isEnabled).toBe(false)
  })

  it.each([
    ['a V4R2 account', () => mocks.walletVersion.mockReturnValue('v4r2')],
    [
      'native TON',
      () =>
        mocks.coin.mockReturnValue({
          ...usdtCoin,
          id: undefined,
          ticker: 'TON',
        }),
    ],
    [
      'a jetton the relay does not take',
      () =>
        mocks.coin.mockReturnValue({ ...usdtCoin, id: '0:' + 'ab'.repeat(32) }),
    ],
    [
      'another chain',
      () => mocks.coin.mockReturnValue({ ...usdtCoin, chain: Chain.Ethereum }),
    ],
  ])(
    'is unavailable and never enabled for %s, whatever the preference',
    (_, arrange) => {
      arrange()
      mocks.preference.mockReturnValue([true, vi.fn()])

      expect(read()).toMatchObject({ isAvailable: false, isEnabled: false })
    }
  )

  it('does not fetch the relay config for a send that could never be gasless', () => {
    mocks.walletVersion.mockReturnValue('v4r2')
    read()

    expect(mocks.config).toHaveBeenCalledWith({ enabled: false })
  })

  it('reports pending only while a candidate send waits for the relay config', () => {
    mocks.config.mockReturnValue({ data: undefined, isPending: true })
    expect(read()).toMatchObject({
      isAvailable: false,
      isEnabled: false,
      isPending: true,
    })

    mocks.walletVersion.mockReturnValue('v4r2')
    expect(read().isPending).toBe(false)
  })
})
