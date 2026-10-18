import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { describe, expect, it } from 'vitest'

import {
  getTypedDataFieldNodes,
  TypedDataFieldNode,
} from './getTypedDataFieldNodes'

const makerWallet = `0x${'aa'.repeat(20)}`
const takerWallet = `0x${'bb'.repeat(20)}`
const token = `0x${'cc'.repeat(20)}`
const itemId = `0x${'01'.repeat(32)}`

const contents =
  'This order lets the counterparty fill every listed item at the quoted price until the expiry passes, and it cannot be cancelled on-chain once it is signed.'

// Shaped like the payload in #5013: a long string, a struct array and
// nested structs.
const orderTypes: Eip712V4Payload['types'] = {
  EIP712Domain: [{ name: 'name', type: 'string' }],
  Order: [
    { name: 'maker', type: 'Person' },
    { name: 'taker', type: 'Person' },
    { name: 'items', type: 'OrderItem[]' },
    { name: 'contents', type: 'string' },
    { name: 'expiry', type: 'uint256' },
    { name: 'filled', type: 'bool' },
  ],
  Person: [
    { name: 'name', type: 'string' },
    { name: 'wallet', type: 'address' },
  ],
  OrderItem: [
    { name: 'id', type: 'bytes32' },
    { name: 'token', type: 'address' },
    { name: 'amount', type: 'uint256' },
  ],
}

const orderMessage = {
  maker: { name: 'Alice', wallet: makerWallet },
  taker: { name: 'Bob', wallet: takerWallet },
  items: [
    { id: itemId, token, amount: '1000000000000000000' },
    { id: itemId, token, amount: '0x10' },
  ],
  contents,
  expiry: 1767225600,
  filled: false,
}

const getOrderNodes = (message: Record<string, unknown> = orderMessage) =>
  getTypedDataFieldNodes({
    types: orderTypes,
    message,
    primaryType: 'Order',
  })

const text = (label: string, value: string): TypedDataFieldNode => ({
  kind: 'text',
  label,
  value,
})

const hex = (label: string, value: string): TypedDataFieldNode => ({
  kind: 'hex',
  label,
  value,
})

const group = (
  label: string,
  typeName: string | undefined,
  children: TypedDataFieldNode[]
): TypedDataFieldNode => ({
  kind: 'group',
  label,
  value: { typeName, children },
})

const collectValues = (nodes: TypedDataFieldNode[]): string[] =>
  nodes.flatMap(node =>
    node.kind === 'group' ? collectValues(node.value.children) : [node.value]
  )

describe('getTypedDataFieldNodes', () => {
  it('breaks nested structs and struct arrays out field by field', () => {
    expect(getOrderNodes()).toEqual([
      group('maker', 'Person', [
        text('name', 'Alice'),
        hex('wallet', makerWallet),
      ]),
      group('taker', 'Person', [
        text('name', 'Bob'),
        hex('wallet', takerWallet),
      ]),
      group('items', 'OrderItem[]', [
        group('#1', 'OrderItem', [
          hex('id', itemId),
          hex('token', token),
          text('amount', '1000000000000000000'),
        ]),
        group('#2', 'OrderItem', [
          hex('id', itemId),
          hex('token', token),
          text('amount', '16'),
        ]),
      ]),
      text('contents', contents),
      text('expiry', '1767225600'),
      text('filled', 'false'),
    ])
  })

  it('never serializes a struct or array into a JSON string', () => {
    expect(collectValues(getOrderNodes()).join('\n')).not.toMatch(/[{[]/)
  })

  it('follows the declared field order, not the message key order', () => {
    const reordered = Object.fromEntries(Object.entries(orderMessage).reverse())

    expect(getOrderNodes(reordered).map(({ label }) => label)).toEqual([
      'maker',
      'taker',
      'items',
      'contents',
      'expiry',
      'filled',
    ])
  })

  it('leaves out message keys the type does not declare, since they are not signed', () => {
    const labels = getOrderNodes({ ...orderMessage, note: 'unsigned' }).map(
      ({ label }) => label
    )

    expect(labels).not.toContain('note')
  })

  it('lists primitive array items one per row, including nested arrays', () => {
    expect(
      getTypedDataFieldNodes({
        types: {
          Batch: [
            { name: 'recipients', type: 'address[]' },
            { name: 'grid', type: 'uint8[][]' },
          ],
        },
        message: { recipients: [makerWallet], grid: [[1], [2, 3]] },
        primaryType: 'Batch',
      })
    ).toEqual([
      group('recipients', 'address[]', [hex('#1', makerWallet)]),
      group('grid', 'uint8[][]', [
        group('#1', 'uint8[]', [text('#1', '1')]),
        group('#2', 'uint8[]', [text('#1', '2'), text('#2', '3')]),
      ]),
    ])
  })

  it('shows empty arrays and structs as a short literal', () => {
    expect(
      getTypedDataFieldNodes({
        types: { Order: [{ name: 'items', type: 'OrderItem[]' }] },
        message: { items: [] },
        primaryType: 'Order',
      })
    ).toEqual([text('items', '[]')])
  })

  it('shows an empty address as text instead of a blank copy row', () => {
    expect(
      getTypedDataFieldNodes({
        types: {
          Call: [
            { name: 'data', type: 'bytes' },
            { name: 'to', type: 'address' },
          ],
        },
        message: { data: '0x', to: '' },
        primaryType: 'Call',
      })
    ).toEqual([hex('data', '0x'), text('to', '')])
  })

  it('walks the raw message when the types do not define the primary type', () => {
    expect(
      getTypedDataFieldNodes({
        types: {},
        message: {
          owner: makerWallet,
          nonce: '0x1',
          meta: { tags: ['a', 'b'] },
        },
        primaryType: 'Missing',
      })
    ).toEqual([
      hex('owner', makerWallet),
      text('nonce', '0x1'),
      group('meta', undefined, [
        group('tags', undefined, [text('#1', 'a'), text('#2', 'b')]),
      ]),
    ])
  })

  it('walks a struct value whose type the types do not define', () => {
    expect(
      getTypedDataFieldNodes({
        types: { Order: [{ name: 'maker', type: 'Person' }] },
        message: { maker: { name: 'Alice' } },
        primaryType: 'Order',
      })
    ).toEqual([group('maker', 'Person', [text('name', 'Alice')])])
  })

  it('does not resolve type names to Object.prototype members', () => {
    const message = { maker: { name: 'Alice' } }
    const types = { Order: [{ name: 'maker', type: 'constructor' }] }

    expect(
      getTypedDataFieldNodes({ types, message, primaryType: 'toString' })
    ).toEqual([group('maker', undefined, [text('name', 'Alice')])])
    expect(
      getTypedDataFieldNodes({ types, message, primaryType: 'Order' })
    ).toEqual([group('maker', 'constructor', [text('name', 'Alice')])])
  })

  it('ignores malformed field definitions', () => {
    expect(
      getTypedDataFieldNodes({
        // Page-supplied JSON is not checked against the declared types.
        types: JSON.parse('{"Order":[{"name":"maker"}]}'),
        message: { maker: 'Alice' },
        primaryType: 'Order',
      })
    ).toEqual([text('maker', 'Alice')])
  })

  it('collapses values nested past the depth cap into JSON text', () => {
    type Nested = { child?: Nested; leaf?: string }
    const deep: Nested = { leaf: 'bottom' }
    let message: Nested = deep
    for (let level = 0; level < 12; level++) {
      message = { child: message }
    }

    const values = collectValues(
      getTypedDataFieldNodes({ types: {}, message, primaryType: 'Deep' })
    )

    // Depths 1-8 render as groups; the value at depth 9 still wraps `deep`
    // in three of the twelve `child` levels.
    expect(values).toEqual([
      JSON.stringify({ child: { child: { child: deep } } }),
    ])
  })

  it('returns no fields for a message that is not an object', () => {
    expect(
      getTypedDataFieldNodes({
        types: orderTypes,
        message: JSON.parse('"not a struct"'),
        primaryType: 'Order',
      })
    ).toEqual([])
  })
})
