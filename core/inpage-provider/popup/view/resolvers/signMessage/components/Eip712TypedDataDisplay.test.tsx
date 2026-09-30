// @vitest-environment happy-dom
import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { Chain } from '@vultisig/core-chain/Chain'
import { TypedDataEncoder } from 'ethers'
import { ThemeProvider } from 'styled-components'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { Eip712PermitDisplay } from './Eip712PermitDisplay'
import { getTypedDataFields } from './typedDataFields'

const { copy } = vi.hoisted(() => ({ copy: vi.fn() }))
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock('react-use', async importOriginal => ({
  ...(await importOriginal<typeof import('react-use')>()),
  useCopyToClipboard: () => [{}, copy],
}))
vi.mock('./PermitTokenRow', () => ({
  PermitTokenRow: ({
    token,
  }: {
    token: { address: string; amount: bigint }
  }) => <div>{`${token.address}: ${token.amount}`}</div>,
}))

const address = '0x1234567890123456789012345678901234567890'
const hash = `0x${'ab'.repeat(32)}`
const contents = 'Review the contents of this order carefully. '.repeat(12)
const payload: Eip712V4Payload = {
  domain: { name: 'A long application domain name '.repeat(8), chainId: 1 },
  primaryType: 'Order',
  types: {
    Order: [
      { name: 'contents', type: 'string' },
      { name: 'items', type: 'Item[]' },
      { name: 'maker', type: 'Person' },
      { name: 'matrix', type: 'uint256[2][]' },
    ],
    Item: [
      { name: 'amount', type: 'uint256' },
      { name: 'id', type: 'bytes32' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
  },
  message: {
    maker: { wallet: address, name: 'Alice' },
    contents,
    items: [
      { id: hash, amount: '1000' },
      { amount: '2000', id: '0xcd' },
    ],
    matrix: [[1, 2]],
    unexpected: { visible: 'extra value' },
  },
}

const show = (value: Eip712V4Payload) =>
  render(
    <ThemeProvider theme={darkTheme}>
      <Eip712PermitDisplay chain={Chain.Ethereum} payload={value} />
    </ThemeProvider>
  )

afterEach(() => {
  cleanup()
  copy.mockClear()
})

describe('generic EIP-712 review', () => {
  it('renders long values, declared field order, indexed arrays, and unexpected fields', () => {
    const before = JSON.stringify(payload)
    const { container } = show(payload)
    const text = container.textContent ?? ''
    expect(text).toContain(payload.domain.name)
    expect(text).toContain(contents)
    expect(text.indexOf('contents')).toBeLessThan(text.indexOf('items'))
    expect(text.indexOf('items')).toBeLessThan(text.indexOf('maker'))
    expect(text.indexOf('name')).toBeLessThan(text.indexOf('wallet'))
    for (const value of [
      '[0]',
      '[1]',
      '1000',
      '2000',
      hash,
      address,
      'Alice',
      'extra value',
    ]) {
      expect(text).toContain(value)
    }
    expect(text).not.toContain('{"')
    expect(JSON.stringify(payload)).toBe(before)
  })

  it('copies the exact address and hex strings using named buttons', () => {
    show(payload)
    fireEvent.click(screen.getByRole('button', { name: 'copy wallet' }))
    expect(copy).toHaveBeenLastCalledWith(address)
    fireEvent.click(screen.getAllByRole('button', { name: 'copy id' })[0])
    expect(copy).toHaveBeenLastCalledWith(hash)
  })

  it('keeps unexpected objects with own toString fields readable', () => {
    show({
      ...payload,
      message: {
        contents: 'safe',
        unexpected: { toString: 'this field must remain visible' },
        extraArray: [{ toString: 'array field must remain visible' }],
      },
    })
    expect(screen.getByText('this field must remain visible')).toBeTruthy()
    expect(screen.getByText('array field must remain visible')).toBeTruthy()
  })

  it('renders a signed struct field named toString without object coercion', () => {
    const value: Eip712V4Payload = {
      domain: {},
      primaryType: 'Order',
      types: {
        Order: [{ name: 'maker', type: 'Person' }],
        Person: [{ name: 'toString', type: 'string' }],
      },
      message: { maker: { toString: 'Alice' } },
    }
    expect(
      TypedDataEncoder.hash(value.domain, value.types, value.message)
    ).toMatch(/^0x/)
    show(value)
    expect(screen.getByText('Alice')).toBeTruthy()
  })

  it('falls back to present entries for malformed declarations', () => {
    const malformedTypes = JSON.parse(
      '{"Order": {"unexpected": "shape"}, "Person": [null, {"name":"wallet"}, {"name":"name","type":"string"}]}'
    )
    expect(
      getTypedDataFields({ contents: 'safe' }, 'Order', malformedTypes)
    ).toEqual([{ name: 'contents', type: undefined, value: 'safe' }])
    expect(
      getTypedDataFields(
        { wallet: address, name: 'Alice' },
        'Person',
        malformedTypes
      )
    ).toEqual([
      { name: 'name', type: 'string', value: 'Alice' },
      { name: 'wallet', type: undefined, value: address },
    ])
  })

  it('shows empty, null, boolean, numeric and mismatched values without hiding data', () => {
    const { container } = show({
      ...payload,
      primaryType: 'toString',
      message: {
        emptyArray: [],
        emptyObject: {},
        emptyString: '',
        nothing: null,
        falseValue: false,
        zero: 0,
        large: 12345678901234567890n,
        unknown: { child: ['kept'] },
      },
    })
    const text = container.textContent ?? ''
    for (const value of [
      '[]',
      '{}',
      '""',
      'null',
      'false',
      '0',
      '12345678901234567890',
      'kept',
    ]) {
      expect(text).toContain(value)
    }
    show({
      ...payload,
      message: { items: 'unexpected string', maker: [address] },
    })
    expect(screen.getByText('unexpected string')).toBeTruthy()
  })

  it('retains the recognized permit summary and falls back for an unrecognized shape', () => {
    const permit: Eip712V4Payload = {
      domain: { verifyingContract: address },
      primaryType: 'Permit',
      types: {},
      message: { spender: address, value: '1000', deadline: '0' },
    }
    const { container } = show(permit)
    expect(container.textContent).toContain('token_approval')
    expect(container.textContent).toContain(`${address}: 1000`)
    expect(container.textContent).toContain('spender')
    expect(container.textContent).toContain('no_expiry')
    cleanup()
    show({ ...permit, message: { unexpected: 'still visible' } })
    expect(screen.getByText('still visible')).toBeTruthy()
    expect(screen.queryByText('token_approval')).toBeNull()
  })
})
