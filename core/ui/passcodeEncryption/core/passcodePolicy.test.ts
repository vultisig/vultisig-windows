import { describe, expect, it } from 'vitest'

import {
  getStoredPasscodeLength,
  isValidNewPasscode,
  isWeakPasscode,
} from './passcodePolicy'

describe('passcodePolicy', () => {
  it('requires six digits for new passcodes', () => {
    expect(isValidNewPasscode('135790')).toBe(true)
    expect(isValidNewPasscode('13579')).toBe(false)
    expect(isValidNewPasscode('1357901')).toBe(false)
    expect(isValidNewPasscode('13579a')).toBe(false)
  })

  it('rejects repeated digits and sequential runs', () => {
    expect(isWeakPasscode('000000')).toBe(true)
    expect(isWeakPasscode('123456')).toBe(true)
    expect(isWeakPasscode('654321')).toBe(true)
    expect(isWeakPasscode('124680')).toBe(false)
  })

  it('keeps legacy installations unlockable while new records use six digits', () => {
    expect(getStoredPasscodeLength()).toBe(5)
    expect(getStoredPasscodeLength(5)).toBe(5)
    expect(getStoredPasscodeLength(6)).toBe(6)
    expect(getStoredPasscodeLength(99)).toBe(6)
  })
})
