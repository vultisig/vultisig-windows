import { describe, expect, it } from 'vitest'

import {
  backupSplashAnimationSource,
  getBackupDeviceAnimationSource,
} from './getBackupAnimationSource'

describe('getBackupDeviceAnimationSource', () => {
  it('returns one-device animation for one or fewer devices', () => {
    expect(getBackupDeviceAnimationSource(1)).toBe('backup-1device')
    expect(getBackupDeviceAnimationSource(0)).toBe('backup-1device')
    expect(getBackupDeviceAnimationSource(-3)).toBe('backup-1device')
  })

  it('returns two-device animation for two devices', () => {
    expect(getBackupDeviceAnimationSource(2)).toBe('backup-2devices')
  })

  it('returns three-device animation for three devices', () => {
    expect(getBackupDeviceAnimationSource(3)).toBe('backup-3devices')
  })

  it('caps at four-device animation for four or more devices', () => {
    expect(getBackupDeviceAnimationSource(4)).toBe('backup-4devices')
    expect(getBackupDeviceAnimationSource(9)).toBe('backup-4devices')
  })

  it('rounds down decimal device counts', () => {
    expect(getBackupDeviceAnimationSource(2.8)).toBe('backup-2devices')
    expect(getBackupDeviceAnimationSource(3.9)).toBe('backup-3devices')
  })
})

describe('backupSplashAnimationSource', () => {
  it('uses onboarding v3 splash source', () => {
    expect(backupSplashAnimationSource).toBe('backup-vault-splash')
  })
})
