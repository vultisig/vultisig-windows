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

// Minimal interpolating stub so the composed error+hint message is exercised.
const t = ((key: string, options?: Record<string, unknown>) => {
  const template =
    key === 'send_invalid_receiver_address_with_hint'
      ? '{{error}}. {{hint}}'
      : key
  if (!options) return template
  return template.replace(/{{(\w+)}}/g, (_, name) =>
    String(options[name] ?? `{{${name}}}`)
  )
}) as TFunction
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

  it('requires a recipient before format validation', () => {
    expect(
      validateSendReceiver({
        receiverAddress: '',
        senderAddress: '0xsender',
        chain: Chain.Ethereum,
        walletCore,
        t,
      })
    ).toBe('enter_address')
    expect(isValidAddress).not.toHaveBeenCalled()
  })

  it('appends the chain-specific format hint when the address is invalid', () => {
    vi.mocked(isValidAddress).mockReturnValue(false)

    expect(
      validateSendReceiver({
        receiverAddress:
          '0x88df016429689c079f3b2f6ad39fa052532c56795b733da78a91ebe6a713944b',
        senderAddress: '0xsender',
        chain: Chain.Ethereum,
        walletCore,
        t,
      })
    ).toBe('send_invalid_receiver_address. send_receiver_format_hint_evm')
  })

  it('surfaces the sender bech32 prefix in the Cosmos hint', () => {
    vi.mocked(isValidAddress).mockReturnValue(false)

    const cosmosT = ((
      key: string,
      options?: { prefix?: string; error?: string; hint?: string }
    ) => {
      if (key === 'send_invalid_receiver_address_with_hint') {
        return `${options?.error}. ${options?.hint}`
      }
      if (key === 'send_receiver_format_hint_cosmos') {
        return `starts with ${options?.prefix}`
      }
      return key
    }) as TFunction

    expect(
      validateSendReceiver({
        receiverAddress: 'not-an-address',
        senderAddress: 'thor1abcdefg',
        chain: Chain.THORChain,
        walletCore,
        t: cosmosT,
      })
    ).toBe('send_invalid_receiver_address. starts with thor')
  })

  it('resolves a format hint for every acceptance-criteria chain family', () => {
    vi.mocked(isValidAddress).mockReturnValue(false)

    const chains = [
      Chain.Ethereum,
      Chain.Cosmos,
      Chain.Bitcoin,
      Chain.Solana,
      Chain.Ripple,
    ]

    for (const chain of chains) {
      const error = validateSendReceiver({
        receiverAddress: 'invalid',
        senderAddress: 'sender1xyz',
        chain,
        walletCore,
        t,
      })
      expect(error).toContain('send_invalid_receiver_address')
      expect(error).toContain('send_receiver_format_hint_')
    }
  })
})
