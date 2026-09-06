import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'
import { describe, expect, it } from 'vitest'

import {
  BannerDismissPolicy,
  bannerDismissPolicy,
  BannerId,
  DismissedBanners,
  isBannerDismissed,
  migrateDismissedBanners,
  recordBannerDismissal,
} from './dismissedBanners'

const ttlOf = (id: BannerId) => {
  const policy = bannerDismissPolicy[id]

  if (!('ttl' in policy)) {
    throw new Error(`Expected a TTL policy for ${id}`)
  }

  return policy.ttl
}

const permanentPolicy = (
  id: BannerId
): Record<BannerId, BannerDismissPolicy> => ({
  ...bannerDismissPolicy,
  [id]: { permanent: null },
})

const now = convertDuration(100, 'd', 'ms')

const vaultA = 'vault-a'
const vaultB = 'vault-b'

const empty: DismissedBanners = { global: {}, byVault: {} }

describe('migrateDismissedBanners', () => {
  it('stamps legacy array entries with the migration time', () => {
    expect(
      migrateDismissedBanners({ stored: ['migrate', 'followOnX'], now })
    ).toEqual({
      global: {
        migrate: { dismissedAt: now },
        followOnX: { dismissedAt: now },
      },
      byVault: {},
    })
  })

  it('returns an empty record for an empty legacy array', () => {
    expect(migrateDismissedBanners({ stored: [], now })).toEqual(empty)
  })

  it('lifts a legacy profile-wide record into the global side', () => {
    expect(
      migrateDismissedBanners({
        stored: { buyVultPromo: { dismissedAt: 42 } },
        now,
      })
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

    expect(migrateDismissedBanners({ stored, now })).toBe(stored)
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
    const dismissedAt = now - ttlOf('buyVultPromo') + 1

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
    const dismissedAt = now - ttlOf('buyVultPromo')

    expect(
      isBannerDismissed({
        banners: { global: { buyVultPromo: { dismissedAt } }, byVault: {} },
        id: 'buyVultPromo',
        now,
        vaultId: vaultA,
      })
    ).toBe(false)
  })

  it('resurfaces a vault-scoped TTL banner once its cooldown elapses', () => {
    const banners: DismissedBanners = {
      global: {},
      byVault: {
        [vaultA]: {
          vaultBackup: { dismissedAt: now - ttlOf('vaultBackup') },
        },
      },
    }

    expect(
      isBannerDismissed({ banners, id: 'vaultBackup', now, vaultId: vaultA })
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
    const banners = migrateDismissedBanners({
      stored: { vaultBackup: { dismissedAt: now } },
      now,
    })

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

describe('isBannerDismissed with a permanent policy', () => {
  it('keeps the banner hidden long after any TTL would have elapsed', () => {
    const dismissedAt = now - convertDuration(3650, 'd', 'ms')

    expect(
      isBannerDismissed({
        banners: { global: { buyVultPromo: { dismissedAt } }, byVault: {} },
        id: 'buyVultPromo',
        now,
        vaultId: vaultA,
        policy: permanentPolicy('buyVultPromo'),
      })
    ).toBe(true)
  })

  it('still shows a permanent-policy banner that was never dismissed', () => {
    expect(
      isBannerDismissed({
        banners: empty,
        id: 'buyVultPromo',
        now,
        vaultId: vaultA,
        policy: permanentPolicy('buyVultPromo'),
      })
    ).toBe(false)
  })

  it('leaves other banners on their own TTL', () => {
    const dismissedAt = now - convertDuration(10, 'd', 'ms')
    const banners: DismissedBanners = {
      global: {
        buyVultPromo: { dismissedAt },
        migrate: { dismissedAt },
      },
      byVault: {},
    }
    const policy = permanentPolicy('migrate')

    // migrate is permanent, buyVultPromo keeps its elapsed 7d TTL.
    expect(
      isBannerDismissed({
        banners,
        id: 'migrate',
        now,
        vaultId: vaultA,
        policy,
      })
    ).toBe(true)
    expect(
      isBannerDismissed({
        banners,
        id: 'buyVultPromo',
        now,
        vaultId: vaultA,
        policy,
      })
    ).toBe(false)
  })

  it('honors a permanent policy for a legacy dismissal after migration', () => {
    const banners = migrateDismissedBanners({ stored: ['followOnX'], now })
    const laterThanAnyTtl = now + convertDuration(3650, 'd', 'ms')

    expect(
      isBannerDismissed({
        banners,
        id: 'followOnX',
        now: laterThanAnyTtl,
        vaultId: vaultA,
        policy: permanentPolicy('followOnX'),
      })
    ).toBe(true)
  })

  it('keeps a dismissed qbtcClaim hidden on its vault for good', () => {
    const banners = recordBannerDismissal({
      banners: empty,
      id: 'qbtcClaim',
      now,
      vaultId: vaultA,
    })
    const laterThanAnyTtl = now + convertDuration(3650, 'd', 'ms')

    expect(
      isBannerDismissed({
        banners,
        id: 'qbtcClaim',
        now: laterThanAnyTtl,
        vaultId: vaultA,
      })
    ).toBe(true)
  })

  it('leaves qbtcClaim showing on a vault it was not dismissed on', () => {
    const banners = recordBannerDismissal({
      banners: empty,
      id: 'qbtcClaim',
      now,
      vaultId: vaultA,
    })

    expect(
      isBannerDismissed({ banners, id: 'qbtcClaim', now, vaultId: vaultB })
    ).toBe(false)
  })
})
