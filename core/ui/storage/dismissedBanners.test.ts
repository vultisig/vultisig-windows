import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'
import { describe, expect, it } from 'vitest'

import {
  BannerDismissPolicy,
  bannerDismissPolicy,
  BannerId,
  DismissedBanners,
  isBannerDismissed,
  migrateDismissedBanners,
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

describe('migrateDismissedBanners', () => {
  it('stamps legacy array entries with the migration time', () => {
    expect(migrateDismissedBanners(['migrate', 'followOnX'], now)).toEqual({
      migrate: { dismissedAt: now },
      followOnX: { dismissedAt: now },
    })
  })

  it('returns an empty record for an empty legacy array', () => {
    expect(migrateDismissedBanners([], now)).toEqual({})
  })

  it('passes through the already-migrated record shape unchanged', () => {
    const stored: DismissedBanners = {
      buyVultPromo: { dismissedAt: 42 },
    }

    expect(migrateDismissedBanners(stored, now)).toBe(stored)
  })
})

describe('isBannerDismissed', () => {
  it('returns false when the banner was never dismissed', () => {
    expect(isBannerDismissed({ banners: {}, id: 'buyVultPromo', now })).toBe(
      false
    )
  })

  it('keeps the banner dismissed while within its TTL', () => {
    const dismissedAt = now - ttlOf('buyVultPromo') + 1

    expect(
      isBannerDismissed({
        banners: { buyVultPromo: { dismissedAt } },
        id: 'buyVultPromo',
        now,
      })
    ).toBe(true)
  })

  it('ignores the dismissal once the TTL has elapsed', () => {
    const dismissedAt = now - ttlOf('buyVultPromo')

    expect(
      isBannerDismissed({
        banners: { buyVultPromo: { dismissedAt } },
        id: 'buyVultPromo',
        now,
      })
    ).toBe(false)
  })

  it('applies a per-banner TTL: buyVultPromo resurfaces before other banners', () => {
    const dismissedAt = now - convertDuration(10, 'd', 'ms')
    const banners: DismissedBanners = {
      buyVultPromo: { dismissedAt },
      migrate: { dismissedAt },
    }

    // 10 days after dismissal: buyVultPromo (7d TTL) is back, migrate (15d TTL) is not.
    expect(isBannerDismissed({ banners, id: 'buyVultPromo', now })).toBe(false)
    expect(isBannerDismissed({ banners, id: 'migrate', now })).toBe(true)
  })
})

describe('isBannerDismissed with a permanent policy', () => {
  it('keeps the banner hidden long after any TTL would have elapsed', () => {
    const dismissedAt = now - convertDuration(3650, 'd', 'ms')

    expect(
      isBannerDismissed({
        banners: { buyVultPromo: { dismissedAt } },
        id: 'buyVultPromo',
        now,
        policy: permanentPolicy('buyVultPromo'),
      })
    ).toBe(true)
  })

  it('still shows a permanent-policy banner that was never dismissed', () => {
    expect(
      isBannerDismissed({
        banners: {},
        id: 'buyVultPromo',
        now,
        policy: permanentPolicy('buyVultPromo'),
      })
    ).toBe(false)
  })

  it('leaves other banners on their own TTL', () => {
    const dismissedAt = now - convertDuration(10, 'd', 'ms')
    const banners: DismissedBanners = {
      buyVultPromo: { dismissedAt },
      migrate: { dismissedAt },
    }
    const policy = permanentPolicy('migrate')

    // migrate is permanent, buyVultPromo keeps its elapsed 7d TTL.
    expect(isBannerDismissed({ banners, id: 'migrate', now, policy })).toBe(
      true
    )
    expect(
      isBannerDismissed({ banners, id: 'buyVultPromo', now, policy })
    ).toBe(false)
  })

  it('honors a permanent policy for a legacy dismissal after migration', () => {
    const banners = migrateDismissedBanners(['followOnX'], now)
    const laterThanAnyTtl = now + convertDuration(3650, 'd', 'ms')

    expect(
      isBannerDismissed({
        banners,
        id: 'followOnX',
        now: laterThanAnyTtl,
        policy: permanentPolicy('followOnX'),
      })
    ).toBe(true)
  })
})
