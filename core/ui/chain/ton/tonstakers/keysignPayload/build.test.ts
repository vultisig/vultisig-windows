import { Address, Cell } from '@ton/core'
import { describe, expect, it } from 'vitest'

import {
  tonstakersBurnMessageValue,
  tonstakersBurnOpcode,
  tonstakersDepositOpcode,
  tonstakersPoolBounceableAddress,
} from '../core'
import { buildTonstakersMessage } from './build'

const owner =
  '0:1111111111111111111111111111111111111111111111111111111111111111'
const jettonWallet =
  '0:2222222222222222222222222222222222222222222222222222222222222222'

describe('buildTonstakersMessage', () => {
  it('builds a TonConnect-style pool deposit message', () => {
    const message = buildTonstakersMessage({
      action: 'stake',
      amount: 2_000_000_000n,
      ownerAddress: owner,
      minimumStake: 1_000_000_000n,
    })

    expect(message.to).toBe(tonstakersPoolBounceableAddress)
    expect(message.amount).toBe('2000000000')

    const body = Cell.fromBase64(message.payload).beginParse()
    expect(body.loadUint(32)).toBe(tonstakersDepositOpcode)
    expect(body.loadUintBig(64)).toBe(0n)
  })

  it('builds a burn to the owner tsTON wallet with immediate-or-NFT flags', () => {
    const amount = 987_654_321n
    const message = buildTonstakersMessage({
      action: 'unstake',
      amount,
      ownerAddress: owner,
      jettonWalletAddress: jettonWallet,
    })

    expect(message.to).toBe(jettonWallet)
    expect(message.amount).toBe(tonstakersBurnMessageValue.toString())

    const body = Cell.fromBase64(message.payload).beginParse()
    expect(body.loadUint(32)).toBe(tonstakersBurnOpcode)
    expect(body.loadUintBig(64)).toBe(0n)
    expect(body.loadCoins()).toBe(amount)
    expect(body.loadAddress().equals(Address.parse(owner))).toBe(true)
    const options = body.loadRef().beginParse()
    expect(options.loadBit()).toBe(false)
    expect(options.loadBit()).toBe(false)
  })

  it('does not allow an unstake without the owner jetton wallet', () => {
    expect(() =>
      buildTonstakersMessage({
        action: 'unstake',
        amount: 1n,
        ownerAddress: owner,
      })
    ).toThrow('Tonstakers jetton wallet is required to unstake')
  })

  it('enforces the 1 TON pool minimum in the signing builder', () => {
    expect(() =>
      buildTonstakersMessage({
        action: 'stake',
        amount: 999_999_999n,
        ownerAddress: owner,
        minimumStake: 1_000_000_000n,
      })
    ).toThrow('Tonstakers stake amount is below the live minimum')
  })

  it('fails closed when live pool validation did not supply a minimum', () => {
    expect(() =>
      buildTonstakersMessage({
        action: 'stake',
        amount: 2_000_000_000n,
        ownerAddress: owner,
      })
    ).toThrow('Tonstakers live minimum is required to stake')
  })
})
