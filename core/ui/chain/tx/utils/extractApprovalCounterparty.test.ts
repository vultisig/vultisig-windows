import { describe, expect, it } from 'vitest'

import { extractApprovalCounterparty } from './extractApprovalCounterparty'

describe('extractApprovalCounterparty', () => {
  it('returns the spender for ERC-20 approve', () => {
    expect(
      extractApprovalCounterparty({
        functionSignature: 'approve(address,uint256)',
        functionArguments: JSON.stringify([
          '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
          '12345',
        ]),
      })
    ).toEqual({
      address: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
      labelKey: 'spender',
    })
  })

  it('returns the operator for setApprovalForAll', () => {
    expect(
      extractApprovalCounterparty({
        functionSignature: 'setApprovalForAll(address,bool)',
        functionArguments: JSON.stringify([
          '0x00000000006c3852cbef3e08e8df289169ede581',
          true,
        ]),
      })
    ).toEqual({
      address: '0x00000000006c3852cbef3e08e8df289169ede581',
      labelKey: 'operator',
    })
  })

  it('returns null for non-approval functions', () => {
    expect(
      extractApprovalCounterparty({
        functionSignature: 'transfer(address,uint256)',
        functionArguments: JSON.stringify([
          '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
          '1',
        ]),
      })
    ).toBeNull()
  })

  it('returns null when args are not a JSON array', () => {
    expect(
      extractApprovalCounterparty({
        functionSignature: 'approve(address,uint256)',
        functionArguments: '{ "spender": "0xabc", "value": "1" }',
      })
    ).toBeNull()
  })

  it('returns null when args JSON is malformed', () => {
    expect(
      extractApprovalCounterparty({
        functionSignature: 'approve(address,uint256)',
        functionArguments: 'not json',
      })
    ).toBeNull()
  })

  it('returns null when the first arg is not a string', () => {
    expect(
      extractApprovalCounterparty({
        functionSignature: 'approve(address,uint256)',
        functionArguments: JSON.stringify([42, '1']),
      })
    ).toBeNull()
  })
})
