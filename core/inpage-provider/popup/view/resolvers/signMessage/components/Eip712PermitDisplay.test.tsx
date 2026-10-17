import { Eip712V4Payload } from '@core/inpage-provider/popup/interface'
import { darkTheme } from '@lib/ui/theme/darkTheme'
import { ToastProvider } from '@lib/ui/toast/ToastProvider'
import { EvmChain } from '@vultisig/core-chain/Chain'
import { renderToString } from 'react-dom/server'
import { ThemeProvider } from 'styled-components'
import { describe, expect, it, vi } from 'vitest'

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}))
vi.mock(
  '@core/inpage-provider/popup/view/resolvers/signMessage/components/PermitTokenRow',
  () => ({ PermitTokenRow: () => <span>permit-token-row</span> })
)

import { Eip712PermitDisplay } from './Eip712PermitDisplay'

const spender = `0x${'22'.repeat(20)}`
const verifyingContract = `0x${'11'.repeat(20)}`

const contents =
  'This order lets the counterparty fill every listed item at the quoted price until the expiry passes.'

const orderPayload: Eip712V4Payload = {
  primaryType: 'Order',
  domain: {
    name: 'A very long marketplace domain name that would not fit on one row',
    chainId: '0x1',
    verifyingContract,
  },
  types: {
    EIP712Domain: [{ name: 'name', type: 'string' }],
    Order: [
      { name: 'maker', type: 'Person' },
      { name: 'items', type: 'OrderItem[]' },
      { name: 'contents', type: 'string' },
    ],
    Person: [
      { name: 'name', type: 'string' },
      { name: 'wallet', type: 'address' },
    ],
    OrderItem: [{ name: 'amount', type: 'uint256' }],
  },
  message: {
    maker: { name: 'Alice', wallet: spender },
    items: [{ amount: '1000' }, { amount: '2000' }],
    contents,
  },
}

const permitPayload: Eip712V4Payload = {
  primaryType: 'Permit',
  domain: { name: 'USD Coin', chainId: 1, verifyingContract },
  types: {
    Permit: [
      { name: 'owner', type: 'address' },
      { name: 'spender', type: 'address' },
      { name: 'value', type: 'uint256' },
      { name: 'nonce', type: 'uint256' },
      { name: 'deadline', type: 'uint256' },
    ],
  },
  message: {
    owner: verifyingContract,
    spender,
    value: '1000000',
    nonce: 0,
    deadline: 1767225600,
  },
}

const render = (payload: Eip712V4Payload) =>
  renderToString(
    <ThemeProvider theme={darkTheme}>
      <ToastProvider>
        <Eip712PermitDisplay chain={EvmChain.Ethereum} payload={payload} />
      </ToastProvider>
    </ThemeProvider>
  )

const copyButtonCount = (html: string) =>
  html.split('aria-label="copy"').length - 1

describe('Eip712PermitDisplay', () => {
  it('breaks nested typed data out into one row per field', () => {
    const html = render(orderPayload)

    for (const label of ['maker', 'name', 'wallet', 'items', '#1', '#2']) {
      expect(html).toContain(`>${label}<`)
    }
    expect(html).toContain('>Person<')
    expect(html).toContain('>OrderItem[]<')
    expect(html).toContain('>1000<')
    expect(html).toContain('>2000<')
    expect(html).toContain(contents)
  })

  it('does not render structs or arrays as minified JSON', () => {
    const html = render(orderPayload)

    expect(html).not.toContain('{&quot;')
    expect(html).not.toContain('[{')
  })

  it('shows the domain with a decimal chain id and a copyable contract', () => {
    const html = render(orderPayload)

    expect(html).toContain(String(orderPayload.domain.name))
    expect(html).toContain('>chain_id<')
    expect(html).toMatch(/>chain_id<.*?>1</)
    expect(html).toContain('>contract<')
    // The verifying contract and the maker's wallet.
    expect(copyButtonCount(html)).toBe(2)
  })

  it('summarises a recognised permit with a copyable spender', () => {
    const html = render(permitPayload)

    expect(html).toContain('token_approval')
    expect(html).toContain('permit-token-row')
    expect(html).toContain('>spender<')
    expect(copyButtonCount(html)).toBe(1)
  })

  it('does not show a permit summary for a struct the hash does not sign as a permit', () => {
    const html = render({
      ...orderPayload,
      primaryType: 'Permit',
      message: { ...orderPayload.message, spender, value: '1' },
    })

    expect(html).not.toContain('token_approval')
    expect(html).toContain('>Order<')
  })

  it('renders a primary type named after an Object.prototype member', () => {
    const html = render({
      primaryType: 'constructor',
      domain: {},
      types: { constructor: [{ name: 'note', type: 'string' }] },
      message: { note: 'hello' },
    })

    expect(html).not.toContain('token_approval')
    expect(html).toContain('>hello<')
  })

  it('renders nothing for a payload missing its message', () => {
    expect(
      render(JSON.parse('{"primaryType":"Order","domain":{},"types":{}}'))
    ).toBe('')
  })
})
