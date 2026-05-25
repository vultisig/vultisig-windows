import { BinaryWriter } from 'cosmjs-types/binary'
import { Coin } from 'cosmjs-types/cosmos/base/v1beta1/coin'
import { describe, expect, it } from 'vitest'

import {
  decodeMsgDelegateToValidatorSet,
  decodeMsgSetValidatorSetPreference,
  decodeMsgUndelegateFromValidatorSet,
  decodeMsgWithdrawDelegationRewards,
} from './osmosisValsetprefDecoders'

// Helpers to hand-encode the proto wire format. These mirror the published
// Osmosis valset-pref schemas — keep in lockstep with the decoders.
const encodeString = (writer: BinaryWriter, fieldNo: number, value: string) =>
  writer.uint32((fieldNo << 3) | 2).string(value)

const encodeMessage = (
  writer: BinaryWriter,
  fieldNo: number,
  payload: Uint8Array
) => {
  writer.uint32((fieldNo << 3) | 2).bytes(payload)
}

const encodeValidatorPreference = (
  valOperAddress: string,
  weight: string
): Uint8Array => {
  const writer = BinaryWriter.create()
  encodeString(writer, 1, valOperAddress)
  encodeString(writer, 2, weight)
  return writer.finish()
}

const encodeMsgSetValidatorSetPreference = (
  delegator: string,
  prefs: Array<{ valOperAddress: string; weight: string }>
): Uint8Array => {
  const writer = BinaryWriter.create()
  encodeString(writer, 1, delegator)
  for (const p of prefs) {
    encodeMessage(
      writer,
      2,
      encodeValidatorPreference(p.valOperAddress, p.weight)
    )
  }
  return writer.finish()
}

const encodeDelegatorAndCoin = (
  delegator: string,
  coinFieldNo: number,
  coin: { denom: string; amount: string }
): Uint8Array => {
  const writer = BinaryWriter.create()
  encodeString(writer, 1, delegator)
  encodeMessage(writer, coinFieldNo, Coin.encode(coin).finish())
  return writer.finish()
}

describe('decodeMsgSetValidatorSetPreference', () => {
  it('decodes delegator + repeated ValidatorPreference', () => {
    const bytes = encodeMsgSetValidatorSetPreference('osmo1abc', [
      { valOperAddress: 'osmovaloper1one', weight: '500000000000000000' },
      { valOperAddress: 'osmovaloper1two', weight: '500000000000000000' },
    ])

    expect(decodeMsgSetValidatorSetPreference(bytes)).toEqual({
      delegator: 'osmo1abc',
      preferences: [
        { valOperAddress: 'osmovaloper1one', weight: '500000000000000000' },
        { valOperAddress: 'osmovaloper1two', weight: '500000000000000000' },
      ],
    })
  })

  it('handles an empty preferences list', () => {
    const writer = BinaryWriter.create()
    encodeString(writer, 1, 'osmo1abc')
    expect(decodeMsgSetValidatorSetPreference(writer.finish())).toEqual({
      delegator: 'osmo1abc',
      preferences: [],
    })
  })
})

describe('decodeMsgDelegateToValidatorSet', () => {
  it('reads coin from field 2', () => {
    const bytes = encodeDelegatorAndCoin('osmo1abc', 2, {
      denom: 'uosmo',
      amount: '1000000',
    })

    expect(decodeMsgDelegateToValidatorSet(bytes)).toEqual({
      delegator: 'osmo1abc',
      coin: { denom: 'uosmo', amount: '1000000' },
    })
  })
})

describe('decodeMsgUndelegateFromValidatorSet', () => {
  it('reads coin from field 3 (per Osmosis proto)', () => {
    const bytes = encodeDelegatorAndCoin('osmo1abc', 3, {
      denom: 'uosmo',
      amount: '500000',
    })

    expect(decodeMsgUndelegateFromValidatorSet(bytes)).toEqual({
      delegator: 'osmo1abc',
      coin: { denom: 'uosmo', amount: '500000' },
    })
  })

  it('leaves coin undefined when only field 2 is present', () => {
    // Defensive: if anyone sends coin at field 2 (the rebalanced variant's
    // numbering), this decoder must NOT pick it up.
    const bytes = encodeDelegatorAndCoin('osmo1abc', 2, {
      denom: 'uosmo',
      amount: '500000',
    })

    expect(decodeMsgUndelegateFromValidatorSet(bytes)).toEqual({
      delegator: 'osmo1abc',
      coin: undefined,
    })
  })
})

describe('decodeMsgWithdrawDelegationRewards', () => {
  it('decodes just the delegator', () => {
    const writer = BinaryWriter.create()
    encodeString(writer, 1, 'osmo1abc')
    expect(decodeMsgWithdrawDelegationRewards(writer.finish())).toEqual({
      delegator: 'osmo1abc',
    })
  })
})
