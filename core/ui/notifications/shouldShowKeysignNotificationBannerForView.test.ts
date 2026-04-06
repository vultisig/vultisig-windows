import { describe, expect, it } from 'vitest'

import { shouldShowKeysignNotificationBannerForView } from './shouldShowKeysignNotificationBannerForView'

describe('shouldShowKeysignNotificationBannerForView', () => {
  it('allows main screens matching iOS global banner behavior', () => {
    expect(shouldShowKeysignNotificationBannerForView({ id: 'vault' })).toBe(
      true
    )
    expect(shouldShowKeysignNotificationBannerForView({ id: 'vaults' })).toBe(
      true
    )
    expect(shouldShowKeysignNotificationBannerForView({ id: 'defi' })).toBe(
      true
    )
    expect(shouldShowKeysignNotificationBannerForView({ id: 'agent' })).toBe(
      true
    )
    expect(shouldShowKeysignNotificationBannerForView({ id: 'send' })).toBe(
      true
    )
    expect(shouldShowKeysignNotificationBannerForView({ id: 'swap' })).toBe(
      true
    )
  })

  it('blocks views where the user is already processing a transaction', () => {
    expect(shouldShowKeysignNotificationBannerForView({ id: 'keysign' })).toBe(
      false
    )
    expect(
      shouldShowKeysignNotificationBannerForView({ id: 'joinKeysign' })
    ).toBe(false)
    expect(shouldShowKeysignNotificationBannerForView({ id: 'deeplink' })).toBe(
      false
    )
  })
})
