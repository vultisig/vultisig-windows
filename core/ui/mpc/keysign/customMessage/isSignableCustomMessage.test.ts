import { makeSignDoc, serializeSignDoc } from '@cosmjs/amino'
import { Chain } from '@vultisig/core-chain/Chain'
import { hexlify, toUtf8Bytes } from 'ethers'
import { describe, expect, it } from 'vitest'

import { serializeAdr36SignDoc } from './adr36'
import { getPersonalSignMessage } from './getPersonalSignMessage'
import { isSignableCustomMessage } from './isSignableCustomMessage'

const typedData = JSON.stringify({
  domain: { name: 'Vultisig', chainId: 1 },
  types: { Mail: [{ name: 'contents', type: 'string' }] },
  primaryType: 'Mail',
  message: { contents: 'Hello from Vultisig' },
})

describe('isSignableCustomMessage', () => {
  it.each([
    ['an ASCII message', 'Hello from Vultisig'],
    ['a multi-byte UTF-8 message', 'héllo 👋'],
    ['a message that starts with digits', '2hello world!'],
    ['an empty message', ''],
    ['a hex message', hexlify(toUtf8Bytes('Hello from Vultisig'))],
  ])('accepts a personal_sign envelope around %s', (_, message) => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Ethereum,
        method: 'personal_sign',
        message: getPersonalSignMessage(message),
      })
    ).toBe(true)
  })

  it.each([Chain.Ethereum, Chain.Arbitrum])(
    'accepts eth_signTypedData_v4 on %s',
    chain => {
      expect(
        isSignableCustomMessage({
          chain,
          method: 'eth_signTypedData_v4',
          message: typedData,
        })
      ).toBe(true)
    }
  )

  it.each([Chain.Tron, Chain.Cosmos, Chain.Solana])(
    'refuses eth_signTypedData_v4 on %s',
    chain => {
      expect(
        isSignableCustomMessage({
          chain,
          method: 'eth_signTypedData_v4',
          message: typedData,
        })
      ).toBe(false)
    }
  )

  it.each([
    ['text', 'Hello from Vultisig'],
    ['JSON null', 'null'],
    [
      'typed data without types',
      JSON.stringify({ domain: {}, types: {}, message: {} }),
    ],
    [
      'typed data missing a field',
      JSON.stringify({ ...JSON.parse(typedData), message: {} }),
    ],
  ])('refuses eth_signTypedData_v4 that is %s', (_, message) => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Ethereum,
        method: 'eth_signTypedData_v4',
        message,
      })
    ).toBe(false)
  })

  it.each(['eth_sign', 'sign_message', 'Personal_Sign', ' personal_sign', ''])(
    'refuses the %j method, even around a valid envelope',
    method => {
      expect(
        isSignableCustomMessage({
          chain: Chain.Ethereum,
          method,
          message: getPersonalSignMessage('Hello from Vultisig'),
        })
      ).toBe(false)
    }
  )

  it.each([
    ['text', 'Hello from Vultisig'],
    ['hex', `0x${'ab'.repeat(32)}`],
  ])('refuses a personal_sign %s message without an envelope', (_, message) => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Ethereum,
        method: 'personal_sign',
        message,
      })
    ).toBe(false)
  })

  it.each([
    ['is longer than the message', '\x19Ethereum Signed Message:\n5hi'],
    ['is shorter than the message', '\x19Ethereum Signed Message:\n1hi'],
    ['is zero-padded', '\x19Ethereum Signed Message:\n05hello'],
    ['is missing', '\x19Ethereum Signed Message:\nhello'],
  ])('refuses a personal_sign envelope whose length %s', (_, message) => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Ethereum,
        method: 'personal_sign',
        message,
      })
    ).toBe(false)
  })

  // `getCustomMessageBytes` would decode the hex up to the trailing `zz` and
  // hash a valid envelope, while the payload is not one as written.
  it('refuses an envelope followed by characters that are not hex', () => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Ethereum,
        method: 'personal_sign',
        message: `${getPersonalSignMessage(`0x${'ab'.repeat(4)}`)}zz`,
      })
    ).toBe(false)
  })

  it('checks a payload without a chain as an Ethereum one', () => {
    expect(
      isSignableCustomMessage({ method: 'eth_sign', message: '0xdeadbeef' })
    ).toBe(false)
  })

  it('checks every EVM chain', () => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Arbitrum,
        method: 'eth_sign',
        message: '0xdeadbeef',
      })
    ).toBe(false)
  })

  it.each(['', 'ethereum', Chain.Bitcoin])(
    'refuses a payload for the unsupported %j chain',
    chain => {
      expect(
        isSignableCustomMessage({
          chain,
          method: 'personal_sign',
          message: getPersonalSignMessage('Hello from Vultisig'),
        })
      ).toBe(false)
    }
  )

  it.each([
    ['its own header', '\x19TRON Signed Message:\n'],
    ['the Ethereum header', '\x19Ethereum Signed Message:\n'],
  ])('accepts a TRON message under %s', (_, header) => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Tron,
        method: 'sign_message',
        message: `${hexlify(toUtf8Bytes(`${header}32`))}${'ab'.repeat(32)}`,
      })
    ).toBe(true)
  })

  it.each([
    ['hex', `0x${'ab'.repeat(32)}`],
    ['text', 'Hello from Vultisig'],
    ['an incomplete header', hexlify(toUtf8Bytes('\x19TRON Signed'))],
  ])('refuses a TRON %s message without a header', (_, message) => {
    expect(
      isSignableCustomMessage({
        chain: Chain.Tron,
        method: 'sign_message',
        message,
      })
    ).toBe(false)
  })

  describe('Cosmos', () => {
    const signer = 'cosmos1qypqxpq9qcrsszg2pvxq6rs0zqg3yyc5lzv7xu'
    const dataBase64 = Buffer.from('Hello from Vultisig').toString('base64')
    const signDoc = serializeAdr36SignDoc({ signer, dataBase64 })

    const serializeAminoSignDoc = (type: string, chainId: string) =>
      hexlify(
        serializeSignDoc(
          makeSignDoc(
            [{ type, value: { signer, data: dataBase64 } }],
            { gas: '0', amount: [] },
            chainId,
            '',
            '0',
            '0'
          )
        )
      )

    it.each([Chain.Cosmos, Chain.THORChain])(
      'accepts an ADR-36 sign doc on %s',
      chain => {
        expect(
          isSignableCustomMessage({
            chain,
            method: 'cosmos_sign_arbitrary',
            message: hexlify(signDoc),
          })
        ).toBe(true)
      }
    )

    it.each([
      ['a hash', `0x${'ab'.repeat(32)}`],
      ['text', 'Hello from Vultisig'],
      [
        'a sign doc with a chain id',
        serializeAminoSignDoc('sign/MsgSignData', 'cosmoshub-4'),
      ],
      [
        'a sign doc with another message',
        serializeAminoSignDoc('cosmos-sdk/MsgSend', ''),
      ],
      [
        'a sign doc serialized differently',
        hexlify(
          toUtf8Bytes(
            JSON.stringify(
              JSON.parse(new TextDecoder().decode(signDoc)),
              null,
              2
            )
          )
        ),
      ],
    ])('refuses %s', (_, message) => {
      expect(
        isSignableCustomMessage({
          chain: Chain.Cosmos,
          method: 'cosmos_sign_arbitrary',
          message,
        })
      ).toBe(false)
    })
  })

  it.each([Chain.Solana])(
    'leaves %s custom messages to their own chain',
    chain => {
      expect(
        isSignableCustomMessage({
          chain,
          method: 'sign_message',
          message: '0xdeadbeef',
        })
      ).toBe(true)
    }
  )
})
