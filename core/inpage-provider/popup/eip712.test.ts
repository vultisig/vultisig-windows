import { describe, expect, it } from 'vitest'

import {
  findEmptyEip712BytesFields,
  getEip712PayloadIssue,
  getEip712SignedPrimaryType,
} from './eip712'
import { Eip712V4Payload } from './interface'

const makePayload = (
  overrides: Partial<Eip712V4Payload> = {}
): Eip712V4Payload => ({
  primaryType: 'Order',
  domain: {
    name: 'Test',
    version: '1',
    chainId: 8453,
    verifyingContract: `0x${'11'.repeat(20)}`,
  },
  types: {
    Order: [
      { name: 'maker', type: 'address' },
      { name: 'salt', type: 'bytes32' },
      { name: 'payload', type: 'bytes' },
      { name: 'items', type: 'Item[]' },
    ],
    Item: [{ name: 'id', type: 'bytes32' }],
  },
  message: {
    maker: `0x${'22'.repeat(20)}`,
    salt: `0x${'00'.repeat(32)}`,
    payload: '0x',
    items: [{ id: `0x${'01'.repeat(32)}` }],
  },
  ...overrides,
})

const withMessage = (message: Record<string, unknown>) =>
  makePayload({ message: { ...makePayload().message, ...message } })

describe('getEip712PayloadIssue', () => {
  it('accepts a signable payload, including "0x" for empty dynamic bytes', () => {
    expect(getEip712PayloadIssue(makePayload())).toBeUndefined()
  })

  it.each(['Item', 'Permit'])(
    'refuses a %s primaryType that is not the struct the hash signs',
    primaryType => {
      expect(getEip712PayloadIssue(makePayload({ primaryType }))).toContain(
        'primaryType'
      )
    }
  )

  it('names a fixed-width bytes field holding an empty string', () => {
    const issue = getEip712PayloadIssue(withMessage({ salt: '' }))
    expect(issue).toContain('message.salt')
    expect(issue).toContain('"0x"')
  })

  it('names a dynamic bytes field holding an empty string', () => {
    expect(getEip712PayloadIssue(withMessage({ payload: '' }))).toContain(
      'message.payload'
    )
  })

  it('names an empty bytes field nested in a struct array', () => {
    expect(
      getEip712PayloadIssue(withMessage({ items: [{ id: '' }] }))
    ).toContain('message.items[0].id')
  })

  it('names an empty domain salt', () => {
    const payload = makePayload({
      domain: { ...makePayload().domain, salt: '' },
    })
    expect(getEip712PayloadIssue(payload)).toContain('domain.salt')
  })

  it('does not blame empty bytes for invalid bytesN widths', () => {
    const payload = makePayload({
      types: {
        Order: [{ name: 'salt', type: 'bytes33' }],
      },
      message: { salt: '' },
    })
    const issue = getEip712PayloadIssue(payload)
    expect(issue).toContain('invalid bytes width')
    expect(issue).not.toContain('empty string in bytes field')
  })

  it('falls back to the ethers message for non-bytes problems', () => {
    const payload = makePayload({
      types: {
        Order: [{ name: 'amount', type: 'uint256' }],
      },
      message: { amount: '' },
    })
    const issue = getEip712PayloadIssue(payload)
    expect(issue).toBeDefined()
    expect(issue).not.toContain('bytes field')
  })
})

describe('findEmptyEip712BytesFields', () => {
  it('collects every empty bytes field across the payload', () => {
    const payload = makePayload({
      domain: { ...makePayload().domain, salt: '' },
      message: {
        maker: `0x${'22'.repeat(20)}`,
        salt: '',
        payload: '',
        items: [{ id: `0x${'01'.repeat(32)}` }, { id: '' }],
      },
    })
    expect(findEmptyEip712BytesFields(payload)).toEqual([
      'message.salt',
      'message.payload',
      'message.items[1].id',
      'domain.salt',
    ])
  })

  it('returns nothing for a well-formed payload', () => {
    expect(findEmptyEip712BytesFields(makePayload())).toEqual([])
  })
})

describe('getEip712SignedPrimaryType', () => {
  it('returns the declared primary type of a well-formed payload', () => {
    expect(getEip712SignedPrimaryType(makePayload())).toBe('Order')
  })

  it('ignores an EIP712Domain entry in the types', () => {
    const payload = makePayload({
      types: {
        ...makePayload().types,
        EIP712Domain: [{ name: 'name', type: 'string' }],
      },
    })
    expect(getEip712SignedPrimaryType(payload)).toBe('Order')
  })

  it('follows the struct the hash signs when the declared type differs', () => {
    const payload = makePayload({ primaryType: 'Permit' })
    expect(getEip712SignedPrimaryType(payload)).toBe('Order')
  })

  it('falls back to the declared type when the types cannot be resolved', () => {
    const payload = makePayload({
      primaryType: 'A',
      types: {
        A: [{ name: 'a', type: 'string' }],
        B: [{ name: 'b', type: 'string' }],
      },
    })
    expect(getEip712SignedPrimaryType(payload)).toBe('A')
  })
})
