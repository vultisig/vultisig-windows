import { Chain } from '@vultisig/core-chain/Chain'
import { isFeeCoin } from '@vultisig/core-chain/coin/utils/isFeeCoin'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { useSendValidationQuery } from './useSendValidationQuery'

const mocks = vi.hoisted(() => ({
  coin: vi.fn(),
  amount: vi.fn(),
  balance: vi.fn(),
  fee: vi.fn(),
  feePaidInCoin: vi.fn(),
  nearLimits: vi.fn(),
  receiver: vi.fn(),
}))

vi.mock('../state/sendCoin', () => ({ useCurrentSendCoin: mocks.coin }))
vi.mock('../amount/useSpendableSendAmount', () => ({
  useSpendableSendAmount: mocks.amount,
}))
vi.mock('../fee/useIsSendFeePaidInCoin', () => ({
  useIsSendFeePaidInCoin: mocks.feePaidInCoin,
}))
vi.mock('./useSendBalanceQuery', () => ({ useSendBalanceQuery: mocks.balance }))
vi.mock('./useNearSendLimitsQuery', () => ({
  useNearSendLimitsQuery: mocks.nearLimits,
}))
vi.mock('./useSendFeeEstimateQuery', () => ({
  useSendFeeEstimateQuery: mocks.fee,
}))
vi.mock('../state/receiverResolution', async importOriginal => ({
  ...(await importOriginal<typeof import('../state/receiverResolution')>()),
  useSendReceiverResolution: mocks.receiver,
}))
vi.mock('../state/memo', () => ({ useSendMemo: () => [''] }))
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
vi.mock('@vultisig/core-chain/utils/isValidRecipient', () => ({
  isValidRecipient: () => true,
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
    mocks.nearLimits.mockReturnValue({
      data: { maxSendable: 90n },
      error: null,
      isPending: false,
    })
    mocks.feePaidInCoin.mockImplementation(() => isFeeCoin(mocks.coin()))
    mocks.receiver.mockReturnValue({ kind: 'address', address: 'rRecipient' })
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

  describe('gasless TON jetton send', () => {
    const usdt = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'

    beforeEach(() => {
      mocks.coin.mockReturnValue({
        chain: Chain.Ton,
        id: usdt,
        address: 'UQCvaZohosTA0ak9ZFMs-cvL1JrXqogqJH8sI2uO6k8clJpn',
      })
      // The relay commission is charged in the jetton itself.
      mocks.feePaidInCoin.mockReturnValue(true)
      // The account holds the jetton and not a single nanoton.
      mocks.balance.mockImplementation(({ id }: { id?: string }) =>
        ready(id ? 100n : 0n)
      )
    })

    it('needs no TON when the jetton covers the amount and the commission', () => {
      mocks.amount.mockReturnValue(98n)
      expect(readValidation()).toMatchObject({
        data: {},
        error: null,
        isPending: false,
      })
    })

    it('does not wait for the native balance at all', () => {
      mocks.balance.mockImplementation(({ id }: { id?: string }) =>
        id ? ready(100n) : pending
      )
      expect(readValidation()).toMatchObject({
        data: {},
        error: null,
        isPending: false,
      })
    })

    it('reports the jetton balance as insufficient once the commission no longer fits', () => {
      mocks.amount.mockReturnValue(99n)
      expect(readValidation().data).toEqual({ amount: 'insufficient_balance' })
    })

    it('waits for the relay commission before enabling Continue', () => {
      mocks.fee.mockReturnValue(pending)
      expect(readValidation()).toMatchObject({
        data: undefined,
        isPending: true,
      })
    })
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

  describe('NEAR native send', () => {
    beforeEach(() => {
      mocks.coin.mockReturnValue({ chain: Chain.Near, address: 'sender' })
      mocks.balance.mockReturnValue(ready(100n))
    })

    it('waits for the send limits before enabling Continue', () => {
      mocks.nearLimits.mockReturnValue({
        data: undefined,
        error: null,
        isPending: true,
      })
      expect(readValidation()).toMatchObject({
        data: undefined,
        isPending: true,
      })
    })

    it('surfaces a failed send limits lookup instead of enabling Continue', () => {
      mocks.nearLimits.mockReturnValue({
        data: undefined,
        error: new Error('limits failed'),
        isPending: false,
      })
      expect(readValidation()).toMatchObject({
        data: undefined,
        error: { message: 'limits failed' },
        isPending: false,
      })
    })

    it('validates once the send limits are known', () => {
      expect(readValidation()).toMatchObject({
        data: {},
        error: null,
        isPending: false,
      })
    })
  })

  describe('receiver typed as a name', () => {
    it.each(['pending', 'resolving'])('waits while the name is %s', kind => {
      mocks.receiver.mockReturnValue({ kind, name: 'vi.thor' })

      expect(readValidation()).toMatchObject({
        data: undefined,
        isPending: true,
      })
    })

    it.each([
      ['notFound', 'send_receiver_name_not_found'],
      ['noAddressForChain', 'send_receiver_name_no_address_for_chain'],
      ['lookupFailed', 'send_receiver_name_lookup_failed'],
    ])('names why a %s name cannot be sent to', (kind, error) => {
      mocks.receiver.mockReturnValue({ kind, name: 'vi.thor' })

      expect(readValidation()).toMatchObject({
        data: { receiverAddress: error },
        isPending: false,
      })
    })

    it('validates the address the name resolved to, not the name', () => {
      mocks.coin.mockReturnValue({ chain: Chain.Tron, address: 'TSender' })
      mocks.receiver.mockReturnValue({
        kind: 'resolved',
        name: 'self.thor',
        address: 'TSender',
      })

      expect(readValidation().data).toMatchObject({
        receiverAddress: 'send_receiver_address_same_as_sender',
      })
    })

    it('accepts a resolved name like a typed address', () => {
      mocks.receiver.mockReturnValue({
        kind: 'resolved',
        name: 'vi.thor',
        address: 'rRecipient',
      })

      expect(readValidation()).toMatchObject({
        data: {},
        error: null,
        isPending: false,
      })
    })
  })
})
