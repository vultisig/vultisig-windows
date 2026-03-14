import { ed25519 } from '@noble/curves/ed25519'
import { describe, expect, it } from 'vitest'

import {
  deriveStoredMoneroOutput,
  getSpendableBalanceFromStoredMoneroOutputs,
} from './outputDerivation'

const privateSpendKeyHex =
  'ccf0ea10e1ea64354f42fa710c2b318e581969cf49046d809d1f0aadb3fc7a02'
const privateViewKeyHex =
  'a28b4b2085592881df94ee95da332c16b5bb773eb8bb74730208cbb236c73806'
const txExtraHex =
  '01d3ce2a622c6e06ed465f81017dd6188c3a6e3d8e65a846f9c98416da0e150a82020901c553d35e54111bd0'
const txOutputs = [
  {
    stealthPublicKeyHex:
      'ee8ca293511571c0005e1c144e49d09b8ff03046dbafb3e064a34cb9fc1994b6',
  },
  {
    stealthPublicKeyHex:
      '9e2e5cd08c8681dbcf2ce66071467e835f7e86613fbfed3c4fb170127b94e107',
  },
]
const ecdhInfo = [
  {
    mask: 'ce90e309ead2b487ec1d4d8af5d649543eb99a7620f6b54e532898527be29704',
    amount: 'f050e6f06de61e5967b2ddd506b4d6d36546065d6aae156ac7bec18c99580c07',
  },
  {
    mask: '867fb98cb29853edbafec91af2df605c12f9aaa81a9165625afb6649f5a65201',
    amount: '2c5ba6612351140e1fb4a8463cc765d0a9bb7d999ba35750f365c5285d77230b',
  },
]

const hexToBytes = (hex: string): Uint8Array => {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes)
    .map(byte => byte.toString(16).padStart(2, '0'))
    .join('')

const scalarFromLittleEndianHex = (hex: string): bigint => {
  const bytes = hexToBytes(hex)
  let scalar = BigInt(0)

  for (let i = bytes.length - 1; i >= 0; i--) {
    scalar = (scalar << BigInt(8)) + BigInt(bytes[i])
  }

  return scalar
}

const publicSpendKeyHex = toHex(
  ed25519.Point.BASE.multiply(
    scalarFromLittleEndianHex(privateSpendKeyHex)
  ).toRawBytes()
)

describe('deriveStoredMoneroOutput', () => {
  it('matches the monero-oxide original RingCT scan vector', () => {
    const first = deriveStoredMoneroOutput({
      amount: 10000n,
      globalIndex: 0n,
      outputKeyHex: txOutputs[0].stealthPublicKeyHex,
      txExtra: hexToBytes(txExtraHex),
      txOutputs,
      rctType: 1,
      ecdhInfo,
      privateViewKeyHex,
      publicSpendKeyHex,
    })

    const second = deriveStoredMoneroOutput({
      amount: 10000n,
      globalIndex: 1n,
      outputKeyHex: txOutputs[1].stealthPublicKeyHex,
      txExtra: hexToBytes(txExtraHex),
      txOutputs,
      rctType: 1,
      ecdhInfo,
      privateViewKeyHex,
      publicSpendKeyHex,
    })

    expect(first).toEqual({
      amount: '10000',
      keyOffsetHex:
        'f1d21a76ea0bb228fbc5f0dece0597a8ffb59de7a04b29f70b7c0310446ea905',
      outputKeyHex: txOutputs[0].stealthPublicKeyHex,
      commitmentMaskHex:
        '05c2f142aaf3054cbff0a022f6c7cb75403fd92af0f9441c072ade3f273f7706',
      globalIndex: '0',
      spent: false,
    })

    expect(second).toEqual({
      amount: '10000',
      keyOffsetHex:
        'c5189738c1cb40e68d464f1a1848a85f6ab2c09652a31849213dc0fefd212806',
      outputKeyHex: txOutputs[1].stealthPublicKeyHex,
      commitmentMaskHex:
        'c8922ce32cb2bf454a6b77bc91423ba7a18412b71fa39a97a2a743c1fe0bad04',
      globalIndex: '1',
      spent: false,
    })
  })
})

describe('getSpendableBalanceFromStoredMoneroOutputs', () => {
  it('excludes spent, frozen, and locked outputs', () => {
    expect(
      getSpendableBalanceFromStoredMoneroOutputs([
        {
          amount: '5',
          keyOffsetHex: '00',
          outputKeyHex: '01',
          commitmentMaskHex: '02',
          globalIndex: '3',
          spent: false,
        },
        {
          amount: '7',
          keyOffsetHex: '04',
          outputKeyHex: '05',
          commitmentMaskHex: '06',
          globalIndex: '7',
          spent: true,
        },
        {
          amount: '11',
          keyOffsetHex: '08',
          outputKeyHex: '09',
          commitmentMaskHex: '0a',
          globalIndex: '11',
          spent: false,
          frozen: true,
        },
        {
          amount: '13',
          keyOffsetHex: '0b',
          outputKeyHex: '0c',
          commitmentMaskHex: '0d',
          globalIndex: '13',
          spent: false,
          locked: true,
        },
      ])
    ).toBe(5n)
  })
})
