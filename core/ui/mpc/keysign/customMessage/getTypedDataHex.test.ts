import { TypedDataEncoder } from 'ethers'
import { describe, expect, it } from 'vitest'

import { getTypedDataHex } from './getTypedDataHex'

const mail = {
  domain: {
    name: 'Ether Mail',
    version: '1',
    chainId: 1,
    verifyingContract: '0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC',
  },
  primaryType: 'Mail',
  types: {
    EIP712Domain: [
      { name: 'name', type: 'string' },
      { name: 'version', type: 'string' },
      { name: 'chainId', type: 'uint256' },
      { name: 'verifyingContract', type: 'address' },
    ],
    Mail: [
      { name: 'from', type: 'Person' },
      { name: 'to', type: 'Person[]' },
      { name: 'contents', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallets', type: 'address[]' },
    ],
  },
  message: {
    from: {
      name: 'Cow',
      wallets: ['0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826'],
    },
    to: [
      {
        name: 'Bob',
        wallets: ['0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB'],
      },
    ],
    contents: 'Hello, Bob!',
  },
}

const withTypes = (types: Record<string, unknown>) =>
  JSON.stringify({ ...mail, types: { ...mail.types, ...types } })

describe('getTypedDataHex', () => {
  it('hashes a payload without unused types as ethers does', () => {
    const { Mail, Person } = mail.types
    expect(getTypedDataHex(JSON.stringify(mail))).toBe(
      TypedDataEncoder.hash(mail.domain, { Mail, Person }, mail.message).slice(
        2
      )
    )
  })

  it.each([
    [
      'a type nothing references',
      { Group: [{ name: 'members', type: 'Person[]' }] },
    ],
    [
      'a type wrapping the primary type',
      { Envelope: [{ name: 'mail', type: 'Mail' }] },
    ],
  ])('hashes a payload declaring %s as if it were absent', (_, types) => {
    expect(getTypedDataHex(withTypes(types))).toBe(
      getTypedDataHex(JSON.stringify(mail))
    )
  })

  it('refuses a self-referencing __proto__ type with a descriptive error', () => {
    const message = JSON.stringify(mail).replace(
      '"Mail":[',
      '"__proto__":[{"name":"next","type":"__proto__"}],"Mail":[{"name":"link","type":"__proto__"},'
    )
    expect(() => getTypedDataHex(message)).not.toThrow(RangeError)
  })

  it.each(['Letter', 'EIP712Domain'])(
    'refuses a %s primaryType the types do not define as a struct',
    primaryType => {
      expect(() =>
        getTypedDataHex(JSON.stringify({ ...mail, primaryType }))
      ).toThrow('primaryType')
    }
  )
})
