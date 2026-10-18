import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it } from 'vitest'

import { isAddressAlreadyAdded } from './isAddressAlreadyAdded'

const checksumEvmAddress = '0x15E9eBd862E8d7cd571062D0fBd41D695A9575AF'
const solanaAddress = 'DRpbCBMxVnDK7maPM5tGv6MvB3v1sRMC86PZ8okm21hy'

describe('isAddressAlreadyAdded', () => {
  it('rejects an EVM address that differs only by letter case', () => {
    expect(
      isAddressAlreadyAdded({
        items: [{ id: 'a', address: checksumEvmAddress }],
        address: checksumEvmAddress.toLowerCase(),
        chain: Chain.Ethereum,
      })
    ).toBe(true)
  })

  it('compares non-EVM addresses case-sensitively', () => {
    expect(
      isAddressAlreadyAdded({
        items: [{ id: 'a', address: solanaAddress }],
        address: solanaAddress.toLowerCase(),
        chain: Chain.Solana,
      })
    ).toBe(false)
  })

  it('rejects an exact duplicate', () => {
    expect(
      isAddressAlreadyAdded({
        items: [{ id: 'a', address: solanaAddress }],
        address: solanaAddress,
        chain: Chain.Solana,
      })
    ).toBe(true)
  })

  it('lets the edited entry keep its address in another case', () => {
    expect(
      isAddressAlreadyAdded({
        items: [{ id: 'a', address: checksumEvmAddress }],
        address: checksumEvmAddress.toLowerCase(),
        chain: Chain.Ethereum,
        editedItemId: 'a',
      })
    ).toBe(false)
  })

  it('still flags another entry with the same address while editing', () => {
    expect(
      isAddressAlreadyAdded({
        items: [
          { id: 'a', address: checksumEvmAddress },
          { id: 'b', address: checksumEvmAddress.toLowerCase() },
        ],
        address: checksumEvmAddress,
        chain: Chain.Ethereum,
        editedItemId: 'a',
      })
    ).toBe(true)
  })

  it('accepts a new address', () => {
    expect(
      isAddressAlreadyAdded({
        items: [{ id: 'a', address: checksumEvmAddress }],
        address: '0x14F6Ed6CBb27b607b0e2a48551a988F1a19c89B6',
        chain: Chain.Ethereum,
      })
    ).toBe(false)
  })
})
