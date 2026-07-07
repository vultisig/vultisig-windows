import { WalletCore } from '@trustwallet/wallet-core'
import { Chain } from '@vultisig/core-chain/Chain'
import { validateUtxoRequirements } from '@vultisig/core-chain/chains/utxo/send/validateUtxoRequirements'
import { Coin } from '@vultisig/core-chain/coin/Coin'
import { isValidAddress } from '@vultisig/core-chain/utils/isValidAddress'
import { TFunction } from 'i18next'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { validateSendForm, validateSendReceiver } from './validateSendForm'

vi.mock('@vultisig/core-chain/utils/isValidAddress', () => ({
  isValidAddress: vi.fn(),
}))

vi.mock(
  '@vultisig/core-chain/chains/utxo/send/validateUtxoRequirements',
  () => ({
    validateUtxoRequirements: vi.fn(),
  })
)

const t = ((key: string) => key) as TFunction
const walletCore = {} as WalletCore

const nativeCoin = (chain: Chain): Coin =>
  ({
    chain,
  }) as Coin

const tokenCoin = (chain: Chain): Coin =>
  ({
    chain,
    id: 'token-id',
  }) as Coin

const validSendForm = (coin: Coin) => ({
  amount: 1n,
  senderAddress: 'sender',
  receiverAddress: 'receiver',
  coin,
})

describe('validateSendForm', () => {
  beforeEach(() => {
    vi.mocked(isValidAddress).mockReturnValue(true)
    vi.mocked(validateUtxoRequirements).mockReturnValue(undefined)
  })

  it('counts network fees against fee-coin sends', () => {
    expect(
      validateSendForm(
        {
          ...validSendForm(nativeCoin(Chain.Ethereum)),
          amount: 95n,
        },
        {
          balance: 100n,
          fee: 6n,
          walletCore,
          t,
        }
      )
    ).toEqual({
      amount: 'insufficient_balance',
    })
  })

  it('blocks token sends when the token amount exceeds token balance', () => {
    expect(
      validateSendForm(
        {
          ...validSendForm(tokenCoin(Chain.Ethereum)),
          amount: 101n,
        },
        {
          balance: 100n,
          nativeBalance: 10n,
          fee: 1n,
          walletCore,
          t,
        }
      )
    ).toEqual({
      amount: 'insufficient_balance',
    })
  })

  it('blocks token sends when native balance cannot pay the network fee', () => {
    expect(
      validateSendForm(
        {
          ...validSendForm(tokenCoin(Chain.Ethereum)),
          amount: 50n,
        },
        {
          balance: 100n,
          nativeBalance: 1n,
          fee: 2n,
          walletCore,
          t,
        }
      )
    ).toEqual({
      amount: 'insufficient_native_balance_for_fee',
    })
  })

  it('uses UTXO validation and surfaces dust errors', () => {
    vi.mocked(validateUtxoRequirements).mockReturnValue('dust_error')

    expect(
      validateSendForm(
        {
          ...validSendForm(nativeCoin(Chain.Bitcoin)),
          amount: 100n,
        },
        {
          balance: 100n,
          fee: 1n,
          walletCore,
          t,
        }
      )
    ).toEqual({
      amount: 'dust_error',
    })
    expect(validateUtxoRequirements).toHaveBeenCalledWith({
      amount: 100n,
      balance: 100n,
      chain: Chain.Bitcoin,
      fee: 1n,
      skipDustCheck: false,
    })
  })

  it('skips Cardano dust checks for native max sends before the fee is known', () => {
    validateSendForm(
      {
        ...validSendForm(nativeCoin(Chain.Cardano)),
        amount: 100n,
      },
      {
        balance: 100n,
        walletCore,
        t,
      }
    )

    expect(validateUtxoRequirements).toHaveBeenCalledWith({
      amount: 100n,
      balance: 100n,
      chain: Chain.Cardano,
      fee: undefined,
      skipDustCheck: true,
    })
  })
})

describe('validateSendReceiver', () => {
  beforeEach(() => {
    vi.mocked(isValidAddress).mockClear()
    vi.mocked(isValidAddress).mockReturnValue(true)
  })

  it('blocks Tron self-sends before address validation', () => {
    expect(
      validateSendReceiver({
        receiverAddress: 'TReceiver',
        senderAddress: 'treceiver',
        chain: Chain.Tron,
        walletCore,
        t,
      })
    ).toBe('send_receiver_address_same_as_sender')
    expect(isValidAddress).not.toHaveBeenCalled()
  })
})
