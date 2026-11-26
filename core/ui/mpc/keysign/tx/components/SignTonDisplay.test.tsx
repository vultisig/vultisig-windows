// @vitest-environment happy-dom
import { create } from '@bufbuild/protobuf'
import { DecodedTonMessage } from '@core/ui/chain/tx/utils/useTonMessageDecode'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import { chainFeeCoin } from '@vultisig/core-chain/coin/chainFeeCoin'
import { KeysignPayloadSchema } from '@vultisig/core-mpc/types/vultisig/keysign/v1/keysign_message_pb'
import {
  SignTonSchema,
  TonMessageSchema,
} from '@vultisig/core-mpc/types/vultisig/keysign/v1/wasm_execute_contract_payload_pb'
import { ThemeProvider } from 'styled-components'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const hooks = vi.hoisted(() => ({ decode: vi.fn(), simulate: vi.fn() }))
vi.mock('@core/ui/chain/tx/utils/useTonMessageDecode', () => ({
  useTonMessageDecode: hooks.decode,
}))
vi.mock('@core/ui/chain/tx/utils/useTonSimulation', () => ({
  useTonSimulation: hooks.simulate,
}))
vi.mock('@core/ui/chain/coin/icon/CoinIcon', () => ({ CoinIcon: () => null }))
vi.mock('@core/ui/chain/coin/verification/TokenVerificationBadge', () => ({
  TokenVerificationBadge: () => null,
}))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))

import { SignTonDisplay } from './SignTonDisplay'

const feeCoin = chainFeeCoin[Chain.Ton]
const sender =
  '0:1111111111111111111111111111111111111111111111111111111111111111'
const recipient =
  '0:2222222222222222222222222222222222222222222222222222222222222222'
const router =
  '0:3333333333333333333333333333333333333333333333333333333333333333'
const simulationSwap = {
  fromCoin: feeCoin,
  fromAmount: 1_000_000_000n,
  toCoin: { chain: Chain.Ton, ticker: 'TEST', decimals: 6 },
  toAmount: 2_980_584n,
}
const message = (to: string, amount: string): DecodedTonMessage => ({
  message: create(TonMessageSchema, { to, amount }),
  intent: null,
  swapIntent: null,
  swapOutputCoin: null,
  jettonCoin: null,
})

const show = (entries: DecodedTonMessage[]) => {
  hooks.decode.mockReturnValue({ decoded: entries, isResolvingJettons: false })
  return render(
    <ThemeProvider theme={darkTheme}>
      <SignTonDisplay
        fromAddress={sender}
        keysignPayload={create(KeysignPayloadSchema)}
        signTon={create(SignTonSchema, {
          tonMessages: entries.map(entry => entry.message),
        })}
      />
    </ThemeProvider>
  )
}

beforeEach(() => {
  hooks.simulate.mockReturnValue({
    data: null,
    isFetching: false,
    isError: false,
  })
})
afterEach(cleanup)

describe('TON approval message visibility', () => {
  it.each([
    { name: 'loading', data: null, isFetching: true, isError: false },
    { name: 'unavailable', data: null, isFetching: false, isError: false },
    { name: 'failed request', data: null, isFetching: false, isError: true },
    {
      name: 'recognized swap',
      data: { swap: simulationSwap, failure: null },
      isFetching: false,
      isError: false,
    },
    {
      name: 'predicted execution failure',
      data: { swap: simulationSwap, failure: { cause: null } },
      isFetching: false,
      isError: false,
    },
  ])('keeps all three messages visible when simulation is $name', state => {
    hooks.simulate.mockReturnValue(state)
    show([
      message(router, '1250000000'),
      message(recipient, '20000000'),
      message(recipient, '20000000'),
    ])
    expect(screen.getAllByText(recipient)).toHaveLength(2)
    expect(screen.getByText(router)).toBeDefined()
    expect(screen.getAllByText(`0.02 ${feeCoin.ticker}`)).toHaveLength(2)
    expect(screen.getByText(`1.25 ${feeCoin.ticker}`)).toBeDefined()
    if (state.data?.swap) {
      expect(
        screen
          .getByText('youre_swapping')
          .compareDocumentPosition(screen.getByText('message 1 · transfer'))
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
    }
    if (state.data?.failure)
      expect(screen.getByText('ton_simulation_will_fail')).toBeDefined()
    if (state.isFetching)
      expect(screen.getByText('blockaid_simulation_pending')).toBeDefined()
    if (state.isError)
      expect(screen.getByText('blockaid_simulation_failed')).toBeDefined()
    for (let index = 1; index <= 3; index++) {
      expect(screen.getByText(`message ${index} · transfer`)).toBeDefined()
    }
  })

  it('retains small self-transfers beside a locally decoded swap', () => {
    const swap: DecodedTonMessage = {
      ...message(router, '1250000000'),
      swapIntent: {
        kind: 'swap',
        provider: 'dedust',
        offerAsset: 'ton',
        offerAmount: 1_000_000_000n,
        minOut: null,
        receiverAddress: sender,
        refundAddress: null,
        excessesAddress: null,
        targetAddress: null,
      },
    }
    show([swap, message(sender, '1000000')])
    expect(screen.getByText(router)).toBeDefined()
    expect(screen.getByText(`1.25 ${feeCoin.ticker}`)).toBeDefined()
    expect(screen.getByText(sender)).toBeDefined()
    expect(screen.getByText(`0.001 ${feeCoin.ticker}`)).toBeDefined()
    expect(
      screen
        .getByText('youre_swapping')
        .compareDocumentPosition(screen.getByText('message 1 · swap'))
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING)
  })

  it('shows the outer contract and attached TON alongside the Jetton recipient and amount', () => {
    show([
      {
        ...message(router, '80000000'),
        intent: {
          kind: 'jettonTransfer',
          queryId: 0n,
          amount: 1_000_000n,
          destination: recipient,
          responseDestination: sender,
          forwardTonAmount: 1n,
        },
        jettonCoin: { chain: Chain.Ton, ticker: 'USDT', decimals: 6 },
      },
    ])
    expect(screen.getByText(router)).toBeDefined()
    expect(screen.getByText(`0.08 ${feeCoin.ticker}`)).toBeDefined()
    expect(screen.getByText(recipient)).toBeDefined()
    expect(screen.getByText('1.0 USDT')).toBeDefined()
  })

  it('exposes each payload and deployment StateInit, including a message with StateInit only', async () => {
    const first = message(router, '1')
    first.message.payload = 'first-payload'
    const second = message(recipient, '2')
    second.message.payload = 'second-payload'
    second.message.stateInit = 'second-deployment'
    const third = message(sender, '3')
    third.message.stateInit = 'third-deployment'
    show([first, second, third])
    const details = screen.getAllByRole('button', {
      name: 'transaction_details',
    })
    expect(details).toHaveLength(3)
    details.forEach(button => fireEvent.click(button))
    expect(await screen.findByText(/first-payload/)).toBeDefined()
    expect(screen.getByText(/second-payload/).textContent).toContain(
      'second-deployment'
    )
    expect(screen.getByText(/third-deployment/).textContent).toContain(
      'stateInit'
    )
  })

  it('preserves every message in a four-message batch', () => {
    show(
      Array.from({ length: 4 }, (_, index) =>
        message(recipient, String(index + 1))
      )
    )
    expect(screen.getAllByText(recipient)).toHaveLength(4)
    expect(screen.getByText('message 4 · transfer')).toBeDefined()
  })
})
