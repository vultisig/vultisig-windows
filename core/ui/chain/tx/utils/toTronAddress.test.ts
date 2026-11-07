import { describe, expect, it } from 'vitest'

import { toTronAddress } from './toTronAddress'

describe('toTronAddress', () => {
  it.each([
    [
      '0xa614f803b6fd780986a42c78ec9c7f77e6ded13c',
      'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    ],
    [
      '0x9c826361267bc0a68f5237ba435ddb0a471afb6e',
      'TQEkcWrgS74WMjUyhaqh1w7hC23wAJuxR9',
    ],
  ])('renders %s as %s', (evmAddress, tronAddress) => {
    expect(toTronAddress(evmAddress)).toBe(tronAddress)
  })

  it('reads a checksummed address the same as a lowercase one', () => {
    expect(toTronAddress('0x9c826361267bc0A68f5237Ba435ddB0A471AFB6E')).toBe(
      'TQEkcWrgS74WMjUyhaqh1w7hC23wAJuxR9'
    )
  })
})
