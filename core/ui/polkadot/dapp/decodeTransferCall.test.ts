import { OtherChain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { decodeSubstrateTransfer } from './decodeTransferCall'

const compactEncode = (value: bigint): number[] => {
  if (value < 64n) return [Number(value) << 2]

  if (value < 16384n) {
    const raw = (value << 2n) | 0b01n
    return [Number(raw & 0xffn), Number((raw >> 8n) & 0xffn)]
  }

  if (value < 1073741824n) {
    const raw = (value << 2n) | 0b10n
    return [0, 1, 2, 3].map(index => Number((raw >> BigInt(8 * index)) & 0xffn))
  }

  const bytes: number[] = []
  let remaining = value
  while (remaining > 0n) {
    bytes.push(Number(remaining & 0xffn))
    remaining >>= 8n
  }

  return [((bytes.length - 4) << 2) | 0b11, ...bytes]
}

const toHex = (bytes: number[]) =>
  `0x${bytes.map(byte => byte.toString(16).padStart(2, '0')).join('')}`

// Alice's well-known development AccountId32, kept as the canonical hex string
// so the SS58 output below is verifiable against any Substrate tool rather
// than against a hand-split byte list.
const aliceAccountIdHex =
  'd43593c715fdd31c61141abd04a99fd6822c8558854ccde39a5684e7a56da27d'

const aliceAccountId = [...Buffer.from(aliceAccountIdHex, 'hex')]

const balancesPallet = 5
const transferAllowDeath = 0
const transferKeepAlive = 3
const multiAddressId = 0x00

const buildTransferCall = ({
  callIndex,
  amount,
}: {
  callIndex: number
  amount: bigint
}) =>
  toHex([
    balancesPallet,
    callIndex,
    multiAddressId,
    ...aliceAccountId,
    ...compactEncode(amount),
  ])

describe('decodeSubstrateTransfer', () => {
  it('reads the value of a transfer_allow_death call', () => {
    const result = decodeSubstrateTransfer({
      method: buildTransferCall({
        callIndex: transferAllowDeath,
        amount: 1_000_000_000n,
      }),
      chain: OtherChain.Bittensor,
    })

    expect(result?.amount).toBe(1_000_000_000n)
  })

  it('reads the value of a transfer_keep_alive call', () => {
    const result = decodeSubstrateTransfer({
      method: buildTransferCall({
        callIndex: transferKeepAlive,
        amount: 12_345_600_000n,
      }),
      chain: OtherChain.Bittensor,
    })

    expect(result?.amount).toBe(12_345_600_000n)
  })

  it.each([
    { label: 'single-byte compact', amount: 42n },
    { label: 'two-byte compact', amount: 16_383n },
    { label: 'four-byte compact', amount: 1_073_741_823n },
    { label: 'big-integer compact', amount: 21_000_000_000_000_000_000n },
  ])('decodes a $label value', ({ amount }) => {
    const result = decodeSubstrateTransfer({
      method: buildTransferCall({ callIndex: transferAllowDeath, amount }),
      chain: OtherChain.Bittensor,
    })

    expect(result?.amount).toBe(amount)
  })

  it('encodes the recipient with the Bittensor SS58 prefix', () => {
    const result = decodeSubstrateTransfer({
      method: buildTransferCall({
        callIndex: transferAllowDeath,
        amount: 1n,
      }),
      chain: OtherChain.Bittensor,
    })

    expect(result?.recipient).toBe(
      '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY'
    )
  })

  it('encodes the recipient with the Polkadot SS58 prefix', () => {
    const result = decodeSubstrateTransfer({
      method: buildTransferCall({
        callIndex: transferAllowDeath,
        amount: 1n,
      }),
      chain: OtherChain.Polkadot,
    })

    expect(result?.recipient).toBe(
      '15oF4uVJwmo4TdGW7VfQxNLavjCXviqxT9S1MgbjMNHr6Sp5'
    )
  })

  it('returns undefined for a call outside the Balances pallet', () => {
    const stakingCall = toHex([7, 2, ...aliceAccountId])

    expect(
      decodeSubstrateTransfer({
        method: stakingCall,
        chain: OtherChain.Bittensor,
      })
    ).toBeUndefined()
  })

  it('returns undefined for transfer_all, which names no value', () => {
    const transferAll = toHex([balancesPallet, 4, multiAddressId, 1])

    expect(
      decodeSubstrateTransfer({
        method: transferAll,
        chain: OtherChain.Bittensor,
      })
    ).toBeUndefined()
  })

  // `parity-scale-codec` rejects each of these with "out of range decoding
  // Compact<T>", so the extrinsic would never decode on chain. Reading a value
  // out of them anyway would show an amount for bytes the runtime refuses.
  it.each([
    {
      label: 'a two-byte compact holding a single-byte value',
      // (5 << 2) | 0b01, then a zero high byte.
      compact: [0x15, 0x00],
    },
    {
      label: 'a four-byte compact holding a single-byte value',
      // (5 << 2) | 0b10, then three zero bytes.
      compact: [0x16, 0x00, 0x00, 0x00],
    },
    {
      label: 'a big-integer compact below the four-byte ceiling',
      // length 4, little-endian 5.
      compact: [0x03, 0x05, 0x00, 0x00, 0x00],
    },
    {
      label: 'a big-integer compact padded with a zero high byte',
      // length 5, little-endian 2^30 followed by padding.
      compact: [0x07, 0x00, 0x00, 0x00, 0x40, 0x00],
    },
    {
      label: 'a big-integer compact wider than a u128 balance',
      // length 17, so no Balance the runtime could decode.
      compact: [0x37, ...Array<number>(16).fill(0), 0x01],
    },
  ])('throws on $label', ({ compact }) => {
    const method = toHex([
      balancesPallet,
      transferAllowDeath,
      multiAddressId,
      ...aliceAccountId,
      ...compact,
    ])

    expect(() =>
      decodeSubstrateTransfer({ method, chain: OtherChain.Bittensor })
    ).toThrow()
  })

  it('throws when a transfer call is truncated', () => {
    const truncated = toHex([
      balancesPallet,
      transferAllowDeath,
      multiAddressId,
      ...aliceAccountId.slice(0, 10),
    ])

    expect(() =>
      decodeSubstrateTransfer({
        method: truncated,
        chain: OtherChain.Bittensor,
      })
    ).toThrow()
  })

  it('throws when a transfer call carries trailing bytes', () => {
    const withTrailing = `${buildTransferCall({
      callIndex: transferAllowDeath,
      amount: 1n,
    })}deadbeef`

    expect(() =>
      decodeSubstrateTransfer({
        method: withTrailing,
        chain: OtherChain.Bittensor,
      })
    ).toThrow()
  })

  it('throws on a MultiAddress variant other than Id', () => {
    const indexVariant = toHex([balancesPallet, transferAllowDeath, 0x01, 4])

    expect(() =>
      decodeSubstrateTransfer({
        method: indexVariant,
        chain: OtherChain.Bittensor,
      })
    ).toThrow()
  })

  it('throws on bytes that are not valid hex', () => {
    expect(() =>
      decodeSubstrateTransfer({
        method: '0xnothex',
        chain: OtherChain.Bittensor,
      })
    ).toThrow()
  })
})
