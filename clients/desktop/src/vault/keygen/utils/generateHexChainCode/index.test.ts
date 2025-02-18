import { describe, expect, it, vi } from 'vitest'

import * as utils from '../../../../chain/utils/getHexEncodedRandomBytes'
import { generateHexChainCode } from '.'

describe('generateHexChainCode', () => {
  it('should return a 64-character hex string', () => {
    const hexCode = generateHexChainCode()
    expect(typeof hexCode).toBe('string')
    expect(hexCode.length).toBe(64)
    expect(hexCode).toMatch(/^[a-f0-9]+$/i)
  })

  it('should call getHexEncodedRandomBytes with 32', () => {
    const spy = vi.spyOn(utils, 'getHexEncodedRandomBytes')
    generateHexChainCode()
    expect(spy).toHaveBeenCalledWith(32)
    spy.mockRestore()
  })
})
