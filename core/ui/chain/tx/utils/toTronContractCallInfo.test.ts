import { describe, expect, it } from 'vitest'

import { toTronContractCallInfo } from './toTronContractCallInfo'

const spender = '0x9c826361267bc0A68f5237Ba435ddB0A471AFB6E'
const maxUint256 = (2n ** 256n - 1n).toString()

describe('toTronContractCallInfo', () => {
  it('shows address arguments as TRON addresses and leaves the rest', () => {
    const info = toTronContractCallInfo({
      functionSignature: 'approve(address,uint256)',
      functionArguments: JSON.stringify([spender, maxUint256], null, 2),
    })

    expect(JSON.parse(info.functionArguments)).toEqual([
      'TQEkcWrgS74WMjUyhaqh1w7hC23wAJuxR9',
      maxUint256,
    ])
    expect(info.functionSignature).toBe('approve(address,uint256)')
  })

  it('converts only the parameters typed as address', () => {
    const info = toTronContractCallInfo({
      functionSignature: 'setData(bytes32,(address,uint256),address)',
      functionArguments: JSON.stringify([
        `0x${'00'.repeat(32)}`,
        [spender, '1'],
        spender,
      ]),
    })

    expect(JSON.parse(info.functionArguments)).toEqual([
      `0x${'00'.repeat(32)}`,
      [spender, '1'],
      'TQEkcWrgS74WMjUyhaqh1w7hC23wAJuxR9',
    ])
  })

  it('returns arguments that are not a JSON array unchanged', () => {
    const info = {
      functionSignature: 'approve(address,uint256)',
      functionArguments: 'not json',
    }

    expect(toTronContractCallInfo(info)).toBe(info)
  })
})
