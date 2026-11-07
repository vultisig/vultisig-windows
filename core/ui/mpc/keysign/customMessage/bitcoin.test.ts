import { secp256k1 } from '@noble/curves/secp256k1'
import { Chain } from '@vultisig/core-chain/Chain'
import { getBytes } from 'ethers'
import { describe, expect, it } from 'vitest'

import {
  encodeBitcoinMessageSignature,
  getBitcoinSignedMessage,
  unwrapBitcoinSignedMessage,
} from './bitcoin'
import { customMessageSupportedChains } from './chains'
import { getCustomMessageDisplayMessage } from './getCustomMessageDisplayMessage'
import { getCustomMessageHex } from './getCustomMessageHex'
import { isSignableCustomMessage } from './isSignableCustomMessage'

// Interoperability vectors from bitcoinjs-message/test/fixtures.json.
const referenceSignature = Buffer.from(
  'HF8nHqFr3K2UKYahhX3soVeoW8W1ECNbr0wfck7lzyXjCS5Q16Ek45zyBuy1Fiy9sTPKVgsqqOuPvbycuVSSVl8=',
  'base64'
)
const signature = {
  r: referenceSignature.subarray(1, 33).toString('hex'),
  s: referenceSignature.subarray(33).toString('hex'),
  recovery_id: '01',
}

const shouldUnwrap = (payload: Uint8Array) => {
  const result = unwrapBitcoinSignedMessage(payload)
  if (!result) throw new Error('not an envelope')
  return result
}

const getDigest = (message: string) =>
  getCustomMessageHex({
    chain: Chain.Bitcoin,
    method: 'sign_message',
    message: getBitcoinSignedMessage(message),
  })

describe('Bitcoin signed-message digest', () => {
  it('is accepted by the custom message pipeline', () => {
    expect(customMessageSupportedChains).toContain(Chain.Bitcoin)
  })

  it.each([
    ['', '80e795d4a4caadd7047af389d9f7f220562feb6196032e2131e10563352c4bcc'],
    [
      'Vires is Numeris',
      'f8a5affbef4a3241b19067aa694562f64f513310817297089a8929a930f4f933',
    ],
    [
      'Virès is Numéris',
      'af3d51b82a6694d76af5b49401d6f824d66cfce6f96213e606e7da95fe675f25',
    ],
  ])('matches the reference hash for %j', (message, expected) => {
    expect(getDigest(message)).toBe(expected)
  })

  it.each([
    [252, 'b7b164ef991d52735c6bb888642ad7eb6b6939dc984a7fceff4376be041d142f'],
    [253, 'df167ad249ff5837e6acada677118b2ecc6757ab4cdade39caead99ef0220230'],
    [65535, 'fade4e6ebe191b9dcf869e37c4ab6a2d5f9ffc1160fbfb84370afb579af7de8d'],
    [65536, 'd5db7ae9446693355e5674d5d17e7b0a29f13fc174055077d9613e9ab2b462fe'],
  ])('encodes the CompactSize boundary at %i bytes', (length, expected) => {
    expect(getDigest('a'.repeat(length))).toBe(expected)
  })

  it('signs a 0x-prefixed message as text, not as hex bytes', () => {
    const payload = getBytes(getBitcoinSignedMessage('0xdeadbeef'))
    expect(Buffer.from(shouldUnwrap(payload)).toString('utf8')).toBe(
      '0xdeadbeef'
    )
  })

  it.each(['', '0xdeadbeef', '0xnot hex', 'hello 🌍\nسلام', 'a'.repeat(300)])(
    'round-trips %j through the envelope and display',
    message => {
      const payload = getBitcoinSignedMessage(message)
      expect(
        isSignableCustomMessage({
          chain: Chain.Bitcoin,
          method: 'sign_message',
          message: payload,
        })
      ).toBe(true)
      expect(
        getCustomMessageDisplayMessage({
          chain: Chain.Bitcoin,
          method: 'sign_message',
          message: payload,
        })
      ).toBe(message)
    }
  )
})

describe('Bitcoin signed-message envelope check', () => {
  const envelope = getBytes(getBitcoinSignedMessage('hello'))

  it.each([
    ['a bare message', Buffer.from('hello')],
    ['a 32-byte digest', Buffer.alloc(32, 1)],
    ['a declared length longer than the message', envelope.slice(0, -1)],
    [
      'trailing bytes after the message',
      Buffer.concat([envelope, Buffer.from([0])]),
    ],
    [
      'a non-minimal length encoding',
      Buffer.concat([
        envelope.slice(0, 25),
        Buffer.from([0xfd, 5, 0]),
        Buffer.from('hello'),
      ]),
    ],
    ['the EIP-191 prefix', Buffer.from('\x19Ethereum Signed Message:\n5hello')],
  ])('refuses %s', (_, bytes) => {
    expect(unwrapBitcoinSignedMessage(bytes)).toBeUndefined()
    expect(
      isSignableCustomMessage({
        chain: Chain.Bitcoin,
        method: 'sign_message',
        message: `0x${Buffer.from(bytes).toString('hex')}`,
      })
    ).toBe(false)
  })

  it('refuses a text payload that is not hex-encoded', () => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Bitcoin,
        method: 'sign_message',
        message: 'hello',
      })
    ).toBe(false)
    expect(() =>
      getCustomMessageHex({
        chain: Chain.Bitcoin,
        method: 'sign_message',
        message: 'hello',
      })
    ).toThrow('not a recognised signing format')
  })

  it('shows a payload that is not an envelope as-is', () => {
    expect(
      getCustomMessageDisplayMessage({
        chain: Chain.Bitcoin,
        method: 'sign_message',
        message: '0xdeadbeef',
      })
    ).toBe('0xdeadbeef')
  })
})

describe('BIP-137 signature encoding', () => {
  it.each([
    ['p2pkhUncompressed', 28],
    ['p2pkh', 32],
    ['p2sh-p2wpkh', 36],
    ['p2wpkh', 40],
  ] as const)(
    'encodes %s and recovers the reference public key',
    (addressType, header) => {
      const result = encodeBitcoinMessageSignature({ signature, addressType })
      expect(result).toHaveLength(65)
      expect(result[0]).toBe(header)
      expect(result.subarray(1)).toEqual(referenceSignature.subarray(1))
      const recovered = secp256k1.Signature.fromCompact(result.subarray(1))
        .addRecoveryBit(1)
        .recoverPublicKey(getDigest('vires is numeris'))
      expect(recovered.toHex(true)).toBe(
        '0279be667ef9dcbbac55a06295ce870b07029bfcdb2dce28d959f2815b16f81798'
      )
    }
  )

  it.each([0, 1, 2, 3])('preserves recovery ID %i', recovery => {
    const result = encodeBitcoinMessageSignature({
      signature: { ...signature, recovery_id: recovery.toString(16) },
      addressType: 'p2wpkh',
    })
    expect(result[0]).toBe(39 + recovery)
  })

  it('left pads short scalars to 32 bytes', () => {
    const result = encodeBitcoinMessageSignature({
      signature: { r: '1', s: '2', recovery_id: '00' },
      addressType: 'p2wpkh',
    })
    expect(result).toHaveLength(65)
    expect(result[32]).toBe(1)
    expect(result[64]).toBe(2)
  })

  it.each([undefined, '', '04', '27', 'zz', '0x01'])(
    'rejects invalid recovery ID %j',
    recovery_id => {
      expect(() =>
        encodeBitcoinMessageSignature({
          signature: { ...signature, recovery_id },
          addressType: 'p2wpkh',
        })
      ).toThrow(/recovery ID/)
    }
  )

  it.each([
    '',
    'zz',
    '0',
    '1'.repeat(65),
    'fffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
  ])('rejects invalid scalars %j', r => {
    expect(() =>
      encodeBitcoinMessageSignature({
        signature: { ...signature, r },
        addressType: 'p2wpkh',
      })
    ).toThrow(/scalar/)
  })
})
