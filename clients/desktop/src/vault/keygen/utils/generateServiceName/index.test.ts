import { describe, expect, it } from 'vitest'

import { generateServiceName } from '.'

describe('generateServiceName', () => {
  it('should return a string that starts with "Vultisig-Windows-"', () => {
    const serviceName = generateServiceName()
    expect(typeof serviceName).toBe('string')
    expect(serviceName.startsWith('Vultisig-Windows-')).toBe(true)
  })
})
