import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'
import { describe, expect, it } from 'vitest'

import {
  bannerDismissalTtl,
  DismissedBanners,
  isBannerDismissed,
  migrateDismissedBanners,
} from './dismissedBanners'

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
    const dismissedAt = now - bannerDismissalTtl.buyVultPromo + 1

    expect(
      isBannerDismissed({
        banners: { buyVultPromo: { dismissedAt } },
        id: 'buyVultPromo',
        now,
      })
    ).toBe(true)
  })

  it('ignores the dismissal once the TTL has elapsed', () => {
    const dismissedAt = now - bannerDismissalTtl.buyVultPromo

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
