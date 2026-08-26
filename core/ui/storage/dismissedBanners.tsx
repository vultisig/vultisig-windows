import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

import { useCore } from '../state/core'
import { StorageKey } from './StorageKey'

export const bannerIds = [
  'followOnX',
  'migrate',
  'agentNavigationCoachmark',
  'buyVultPromo',
  'rujiraStaking',
  'vaultBackup',
  'referralCode',
  'kamino',
] as const

export type BannerId = (typeof bannerIds)[number]

export type BannerDismissal = {
  dismissedAt: number
}

/**
 * Global, timestamped record of dismissed banners. Each banner keeps its own
 * dismissal time so it can resurface once its per-banner TTL has elapsed.
 */
export type DismissedBanners = Partial<Record<BannerId, BannerDismissal>>

/** Legacy on-disk shape: a plain list of dismissed banner ids without timestamps. */
export type LegacyDismissedBanners = BannerId[]

/** Either the legacy array shape or the current timestamped record shape. */
export type StoredDismissedBanners = DismissedBanners | LegacyDismissedBanners

/**
 * What a dismissal means for a given banner: `ttl` lets it resurface once that
 * many ms have elapsed, `permanent` keeps it hidden for good.
 */
export type BannerDismissPolicy = { ttl: number } | { permanent: null }

/**
 * Per-banner dismissal policy. Configurable per banner rather than hard-coded
 * in carousel logic. These are the fallback values used until a remote policy
 * assigns something else.
 */
export const bannerDismissPolicy: Record<BannerId, BannerDismissPolicy> = {
  buyVultPromo: { ttl: convertDuration(7, 'd', 'ms') },
  followOnX: { ttl: convertDuration(15, 'd', 'ms') },
  migrate: { ttl: convertDuration(15, 'd', 'ms') },
  agentNavigationCoachmark: { ttl: convertDuration(15, 'd', 'ms') },
  rujiraStaking: { ttl: convertDuration(7, 'd', 'ms') },
  vaultBackup: { ttl: convertDuration(7, 'd', 'ms') },
  referralCode: { ttl: convertDuration(7, 'd', 'ms') },
  kamino: { ttl: convertDuration(7, 'd', 'ms') },
}

/**
 * Reads either storage shape into the current timestamped record. Legacy
 * entries (no timestamp) are stamped with `now` so the TTL clock starts from
 * the migration moment instead of expiring or never elapsing.
 */
export const migrateDismissedBanners = (
  stored: StoredDismissedBanners,
  now: number
): DismissedBanners => {
  if (!Array.isArray(stored)) {
    return stored
  }

  return Object.fromEntries(stored.map(id => [id, { dismissedAt: now }]))
}

type IsBannerDismissedInput = {
  banners: DismissedBanners
  id: BannerId
  now: number
  policy?: Record<BannerId, BannerDismissPolicy>
}

/**
 * Whether a dismissal still hides the banner. A `permanent` policy hides it for
 * good; a `ttl` policy only hides it until that window has elapsed.
 */
export const isBannerDismissed = ({
  banners,
  id,
  now,
  policy = bannerDismissPolicy,
}: IsBannerDismissedInput): boolean => {
  const dismissal = banners[id]
  if (!dismissal) {
    return false
  }

  return matchRecordUnion<BannerDismissPolicy, boolean>(policy[id], {
    ttl: ms => now - dismissal.dismissedAt < ms,
    permanent: () => true,
  })
}

type GetDismissedBannersFunction = () => Promise<StoredDismissedBanners>
type SetDismissedBannersFunction = (banners: DismissedBanners) => Promise<void>

export type DismissedBannersStorage = {
  getDismissedBanners: GetDismissedBannersFunction
  setDismissedBanners: SetDismissedBannersFunction
}

const useDismissedBannersQuery = () => {
  const { getDismissedBanners, setDismissedBanners } = useCore()

  return useQuery({
    queryKey: [StorageKey.dismissedBanners],
    queryFn: async () => {
      const stored = await getDismissedBanners()
      const migrated = migrateDismissedBanners(stored, Date.now())

      if (Array.isArray(stored) && stored.length > 0) {
        await setDismissedBanners(migrated)
      }

      return migrated
    },
    ...noRefetchQueryOptions,
  })
}

export const useDismissedBanners = () => {
  const { data } = useDismissedBannersQuery()

  return {
    hasLoaded: data !== undefined,
    isBannerDismissed: (id: BannerId) =>
      isBannerDismissed({ banners: data || {}, id, now: Date.now() }),
  }
}

const useDismissBannerMutation = () => {
  const { getDismissedBanners, setDismissedBanners } = useCore()
  const refetchQueries = useRefetchQueries()

  const mutationFn = async (bannerId: BannerId) => {
    // Read the latest stored state at mutation time rather than merging against
    // a render-time snapshot, so quick successive dismissals don't drop each
    // other's entries.
    const current = migrateDismissedBanners(
      await getDismissedBanners(),
      Date.now()
    )
    await setDismissedBanners({
      ...current,
      [bannerId]: { dismissedAt: Date.now() },
    })
    await refetchQueries([StorageKey.dismissedBanners])
  }

  return useMutation({
    mutationFn,
  })
}

export const useDismissBanner = () => {
  const { mutateAsync } = useDismissBannerMutation()

  return (bannerId: BannerId) => mutateAsync(bannerId)
}
