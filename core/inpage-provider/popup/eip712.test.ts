import { describe, expect, it } from 'vitest'

import { findEmptyEip712BytesFields, getEip712PayloadIssue } from './eip712'
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
