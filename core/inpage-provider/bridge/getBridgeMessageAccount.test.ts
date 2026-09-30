import { describe, expect, it } from 'vitest'

import { getBridgeMessageAccount } from './getBridgeMessageAccount'

const account = '0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6'

describe('getBridgeMessageAccount', () => {
  it('reads the account from a popup call', () => {
    expect(getBridgeMessageAccount({ popup: { options: { account } } })).toBe(
      account
    )
  })

  it('reads the account from a background call', () => {
    expect(
      getBridgeMessageAccount({ background: { options: { account } } })
    ).toBe(account)
  })

  it('is undefined when the call names no account', () => {
    expect(getBridgeMessageAccount({ popup: { options: {} } })).toBeUndefined()
    expect(getBridgeMessageAccount({ background: {} })).toBeUndefined()
  })
})
