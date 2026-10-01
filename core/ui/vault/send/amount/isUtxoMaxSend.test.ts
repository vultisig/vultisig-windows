import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { isUtxoMaxSend } from './isUtxoMaxSend'

const balance = 1_000_000n
const fee = 550n

describe('isUtxoMaxSend', () => {
  it('flags a UTXO send of the balance less the fee', () => {
    expect(
      isUtxoMaxSend({ chain: Chain.Bitcoin, amount: 999_450n, balance, fee })
    ).toBe(true)
  })

  it('flags an amount the fee no longer leaves room for, such as Max before a higher fee', () => {
    expect(
      isUtxoMaxSend({ chain: Chain.Bitcoin, amount: 999_600n, balance, fee })
    ).toBe(true)
    expect(
      isUtxoMaxSend({ chain: Chain.Bitcoin, amount: balance, balance, fee })
    ).toBe(true)
  })

  it('leaves a UTXO send below that amount as an ordinary send', () => {
    expect(
      isUtxoMaxSend({ chain: Chain.Bitcoin, amount: 999_449n, balance, fee })
    ).toBe(false)
  })

  it('leaves an amount above the balance for validation to reject', () => {
    expect(
      isUtxoMaxSend({
        chain: Chain.Bitcoin,
        amount: balance + 1n,
        balance,
        fee,
      })
    ).toBe(false)
  })

  it.each([Chain.Ethereum, Chain.Ton, Chain.Cardano])(
    'never flags %s, which signs the amount as given',
    chain => {
      expect(isUtxoMaxSend({ chain, amount: 999_450n, balance, fee })).toBe(
        false
      )
    }
  )

  it('never flags a send when the fee takes the whole balance', () => {
    expect(
      isUtxoMaxSend({ chain: Chain.Bitcoin, amount: 0n, balance: fee, fee })
    ).toBe(false)
  })
})
