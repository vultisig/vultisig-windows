import { describe, expect, it } from 'vitest'

import {
  backupSplashAnimationSource,
  getBackupDeviceAnimationSource,
} from './getBackupAnimationSource'

describe('getBackupDeviceAnimationSource', () => {
  it('returns one-device animation for one or fewer devices', () => {
    expect(getBackupDeviceAnimationSource(1)).toBe('backup_device1')
    expect(getBackupDeviceAnimationSource(0)).toBe('backup_device1')
    expect(getBackupDeviceAnimationSource(-3)).toBe('backup_device1')
  })

  it('returns two-device animation for two devices', () => {
    expect(getBackupDeviceAnimationSource(2)).toBe('backup_device2')
  })

  it('returns three-device animation for three devices', () => {
    expect(getBackupDeviceAnimationSource(3)).toBe('backup_device3')
  })

  it('caps at four-device animation for four or more devices', () => {
    expect(getBackupDeviceAnimationSource(4)).toBe('backup_device4')
    expect(getBackupDeviceAnimationSource(9)).toBe('backup_device4')
  })

  it('rounds down decimal device counts', () => {
    expect(getBackupDeviceAnimationSource(2.8)).toBe('backup_device2')
    expect(getBackupDeviceAnimationSource(3.9)).toBe('backup_device3')
  })
})

describe('backupSplashAnimationSource', () => {
  it('uses onboarding v3 splash source', () => {
    expect(backupSplashAnimationSource).toBe('backup-vault-splash')
  })
})
