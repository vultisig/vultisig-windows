import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'
import { describe, expect, it } from 'vitest'

import {
  bannerDismissalTtl,
  DismissedBanners,
  isBannerDismissed,
  migrateDismissedBanners,
  recordBannerDismissal,
} from './dismissedBanners'

const now = convertDuration(100, 'd', 'ms')

const vaultA = 'vault-a'
const vaultB = 'vault-b'

const empty: DismissedBanners = { global: {}, byVault: {} }

describe('migrateDismissedBanners', () => {
  it('stamps legacy array entries with the migration time', () => {
    expect(migrateDismissedBanners(['migrate', 'followOnX'], now)).toEqual({
      global: {
        migrate: { dismissedAt: now },
        followOnX: { dismissedAt: now },
      },
      byVault: {},
    })
  })

  it('returns an empty record for an empty legacy array', () => {
    expect(migrateDismissedBanners([], now)).toEqual(empty)
  })

  it('lifts a legacy profile-wide record into the global side', () => {
    expect(
      migrateDismissedBanners({ buyVultPromo: { dismissedAt: 42 } }, now)
    ).toEqual({
      global: { buyVultPromo: { dismissedAt: 42 } },
      byVault: {},
    })
  })

  it('passes through the already-migrated shape unchanged', () => {
    const stored: DismissedBanners = {
      global: { buyVultPromo: { dismissedAt: 42 } },
      byVault: { [vaultA]: { vaultBackup: { dismissedAt: 42 } } },
    }

    expect(migrateDismissedBanners(stored, now)).toBe(stored)
  })
})

describe('isBannerDismissed', () => {
  it('returns false when the banner was never dismissed', () => {
    expect(
      isBannerDismissed({
        banners: empty,
        id: 'buyVultPromo',
        now,
        vaultId: vaultA,
      })
    ).toBe(false)
  })

  it('keeps the banner dismissed while within its TTL', () => {
    const dismissedAt = now - bannerDismissalTtl.buyVultPromo + 1

    expect(
      isBannerDismissed({
        banners: { global: { buyVultPromo: { dismissedAt } }, byVault: {} },
        id: 'buyVultPromo',
        now,
        vaultId: vaultA,
      })
    ).toBe(true)
  })

  it('ignores the dismissal once the TTL has elapsed', () => {
    const dismissedAt = now - bannerDismissalTtl.buyVultPromo

    expect(
      isBannerDismissed({
        banners: { global: { buyVultPromo: { dismissedAt } }, byVault: {} },
        id: 'buyVultPromo',
        now,
        vaultId: vaultA,
      })
    ).toBe(false)
  })

  it('resurfaces the QBTC claim banner once its cooldown elapses', () => {
    const banners: DismissedBanners = {
      global: {},
      byVault: {
        [vaultA]: {
          qbtcClaim: { dismissedAt: now - bannerDismissalTtl.qbtcClaim },
        },
      },
    }

    expect(
      isBannerDismissed({ banners, id: 'qbtcClaim', now, vaultId: vaultA })
    ).toBe(false)
  })

  it('applies a per-banner TTL: buyVultPromo resurfaces before other banners', () => {
    const dismissedAt = now - convertDuration(10, 'd', 'ms')
    const banners: DismissedBanners = {
      global: {
        buyVultPromo: { dismissedAt },
        migrate: { dismissedAt },
      },
      byVault: {},
    }

    // 10 days after dismissal: buyVultPromo (7d TTL) is back, migrate (15d TTL) is not.
    expect(
      isBannerDismissed({ banners, id: 'buyVultPromo', now, vaultId: vaultA })
    ).toBe(false)
    expect(
      isBannerDismissed({ banners, id: 'migrate', now, vaultId: vaultA })
    ).toBe(true)
  })

  it('hides a global banner on every vault', () => {
    const banners = recordBannerDismissal({
      banners: empty,
      id: 'buyVultPromo',
      now,
      vaultId: vaultA,
    })

    expect(
      isBannerDismissed({ banners, id: 'buyVultPromo', now, vaultId: vaultA })
    ).toBe(true)
    expect(
      isBannerDismissed({ banners, id: 'buyVultPromo', now, vaultId: vaultB })
    ).toBe(true)
  })

  it('hides a vault-scoped banner only on the vault it was dismissed on', () => {
    const banners = recordBannerDismissal({
      banners: empty,
      id: 'vaultBackup',
      now,
      vaultId: vaultA,
    })

    expect(
      isBannerDismissed({ banners, id: 'vaultBackup', now, vaultId: vaultA })
    ).toBe(true)
    expect(
      isBannerDismissed({ banners, id: 'vaultBackup', now, vaultId: vaultB })
    ).toBe(false)
  })

  it('ignores a legacy profile-wide dismissal of a vault-scoped banner', () => {
    const banners = migrateDismissedBanners(
      { vaultBackup: { dismissedAt: now } },
      now
    )

    expect(
      isBannerDismissed({ banners, id: 'vaultBackup', now, vaultId: vaultA })
    ).toBe(false)
  })
})

describe('recordBannerDismissal', () => {
  it('writes a global banner to the global record', () => {
    expect(
      recordBannerDismissal({
        banners: empty,
        id: 'followOnX',
        now,
        vaultId: vaultA,
      })
    ).toEqual({
      global: { followOnX: { dismissedAt: now } },
      byVault: {},
    })
  })

  it('writes a vault-scoped banner under its vault', () => {
    expect(
      recordBannerDismissal({
        banners: empty,
        id: 'referralCode',
        now,
        vaultId: vaultA,
      })
    ).toEqual({
      global: {},
      byVault: { [vaultA]: { referralCode: { dismissedAt: now } } },
    })
  })

  it('keeps other vaults and other banners intact', () => {
    const banners: DismissedBanners = {
      global: { followOnX: { dismissedAt: 1 } },
      byVault: { [vaultB]: { vaultBackup: { dismissedAt: 2 } } },
    }

    expect(
      recordBannerDismissal({
        banners,
        id: 'vaultBackup',
        now,
        vaultId: vaultA,
      })
    ).toEqual({
      global: { followOnX: { dismissedAt: 1 } },
      byVault: {
        [vaultB]: { vaultBackup: { dismissedAt: 2 } },
        [vaultA]: { vaultBackup: { dismissedAt: now } },
      },
    })
  })
})
