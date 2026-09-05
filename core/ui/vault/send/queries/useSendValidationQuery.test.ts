import { Chain } from '@vultisig/core-chain/Chain'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSendValidationQuery } from './useSendValidationQuery'

const mocks = vi.hoisted(() => ({
  coin: vi.fn(),
  amount: vi.fn(),
  balance: vi.fn(),
  fee: vi.fn(),
}))

vi.mock('../state/sendCoin', () => ({ useCurrentSendCoin: mocks.coin }))
vi.mock('../amount/useSpendableSendAmount', () => ({
  useSpendableSendAmount: mocks.amount,
}))
vi.mock('./useSendBalanceQuery', () => ({ useSendBalanceQuery: mocks.balance }))
vi.mock('./useSendFeeEstimateQuery', () => ({
  useSendFeeEstimateQuery: mocks.fee,
}))
vi.mock('../state/receiver', () => ({ useSendReceiver: () => ['rRecipient'] }))
vi.mock('../state/destinationTag', () => ({
  useSendDestinationTagInput: () => [''],
  getSendDestinationTag: () => ({ error: false }),
}))
vi.mock('../../../chain/providers/WalletCoreProvider', () => ({
  useAssertWalletCore: () => ({}),
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('@vultisig/core-chain/utils/isValidAddress', () => ({
  isValidAddress: () => true,
}))

type FundingQuery = {
  data: bigint | undefined
  error: Error | null
  isPending: boolean
}
const ready = (data: bigint): FundingQuery => ({
  data,
  error: null,
  isPending: false,
})
const pending: FundingQuery = { data: undefined, error: null, isPending: true }

const readValidation = () => {
  const Harness = () => {
    const result = useSendValidationQuery()
    return createElement(
      'script',
      { type: 'application/json' },
      JSON.stringify({
        ...result,
        error: result.error
          ? {
              message:
                result.error instanceof Error
                  ? result.error.message
                  : String(result.error),
            }
          : null,
      })
    )
  }
  const html = renderToStaticMarkup(createElement(Harness))
  const result = JSON.parse(
    html.slice(html.indexOf('>') + 1, html.lastIndexOf('</script>'))
  )
  return { data: result.data, error: result.error, isPending: result.isPending }
}

describe('useSendValidationQuery token funding', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.coin.mockReturnValue({
      chain: Chain.Ripple,
      id: 'RLUSD.issuer',
      address: 'rSender',
    })
    mocks.amount.mockReturnValue(50n)
    mocks.balance.mockImplementation(({ id }: { id?: string }) =>
      ready(id ? 100n : 10n)
    )
    mocks.fee.mockReturnValue(ready(2n))
  })

  it('allows a token send only when its balance and native fee funding are known', () => {
    expect(readValidation()).toMatchObject({
      data: {},
      error: null,
      isPending: false,
    })
  })

  it('checks the actual native fee for XRP tokens', () => {
    mocks.balance.mockImplementation(({ id }: { id?: string }) =>
      ready(id ? 100n : 1n)
    )

    expect(readValidation().data).toEqual({
      amount: 'insufficient_native_balance_for_fee',
    })
  })

  it('does not treat a Terra Classic USTC-denominated fee as a LUNC fee', () => {
    mocks.coin.mockReturnValue({
      chain: Chain.TerraClassic,
      id: 'uusd',
      address: 'sender',
    })
    mocks.balance.mockImplementation(({ id }: { id?: string }) =>
      ready(id ? 100n : 0n)
    )
    expect(readValidation()).toMatchObject({
      data: {},
      error: null,
      isPending: false,
    })
  })

  it('treats zero native balance as insufficient, not as a pending balance', () => {
    mocks.balance.mockImplementation(({ id }: { id?: string }) =>
      ready(id ? 100n : 0n)
    )
    expect(readValidation()).toMatchObject({
      data: { amount: 'insufficient_native_balance_for_fee' },
      isPending: false,
    })
  })

  it('waits for the native balance even when token validation already passes', () => {
    mocks.balance.mockImplementation(({ id }: { id?: string }) =>
      id ? ready(100n) : pending
    )
    expect(readValidation()).toMatchObject({ data: undefined, isPending: true })
  })

  it('waits for the fee even when both balances are known', () => {
    mocks.fee.mockReturnValue(pending)
    expect(readValidation()).toMatchObject({ data: undefined, isPending: true })
  })

  it('surfaces a failed native-balance lookup', () => {
    const error = new Error('Native balance unavailable')
    mocks.balance.mockImplementation(({ id }: { id?: string }) =>
      id ? ready(100n) : { data: undefined, error, isPending: false }
    )
    expect(readValidation()).toMatchObject({
      data: undefined,
      error: { message: error.message },
      isPending: false,
    })
  })

  it('surfaces a failed fee lookup instead of enabling Continue', () => {
    const error = new Error('Fee unavailable')
    mocks.fee.mockReturnValue({ data: undefined, error, isPending: false })
    expect(readValidation()).toMatchObject({
      data: undefined,
      error: { message: error.message },
      isPending: false,
    })
  })

  it('still reports a known token-amount error while funding is pending', () => {
    mocks.amount.mockReturnValue(101n)
    mocks.fee.mockReturnValue(pending)
    expect(readValidation().data).toEqual({ amount: 'insufficient_balance' })
  })

  it('does not require a separate native-balance result for native XRP sends', () => {
    mocks.coin.mockReturnValue({ chain: Chain.Ripple, address: 'rSender' })
    mocks.balance
      .mockReset()
      .mockReturnValueOnce(ready(100n))
      .mockReturnValueOnce(pending)
    expect(readValidation()).toMatchObject({
      data: {},
      error: null,
      isPending: false,
    })
  })
})
