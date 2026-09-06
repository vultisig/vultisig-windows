import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'
import { match } from '@vultisig/lib-utils/match'
import { matchRecordUnion } from '@vultisig/lib-utils/matchRecordUnion'
import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

import { useCore } from '../state/core'
import { useAssertCurrentVaultId } from './currentVaultId'
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
  'qbtcClaim',
] as const

export type BannerId = (typeof bannerIds)[number]

type BannerDismissal = {
  dismissedAt: number
}

/** One dismissal record: the banners waved away, each with when it happened. */
export type BannerDismissals = Partial<Record<BannerId, BannerDismissal>>

/**
 * Dismissals split by what they apply to. `global` covers the whole profile;
 * `byVault` keeps a separate record per vault id, so a banner gated on the
 * current vault is only hidden on the vault it was dismissed on.
 */
export type DismissedBanners = {
  global: BannerDismissals
  byVault: Partial<Record<string, BannerDismissals>>
}

/** Legacy on-disk shape: a plain list of dismissed banner ids without timestamps. */
export type LegacyDismissedBannerIds = BannerId[]

/** Legacy on-disk shape: one timestamped record covering the whole profile. */
export type LegacyDismissedBannerRecord = BannerDismissals

/** Any shape the key may hold on disk, current or legacy. */
export type StoredDismissedBanners =
  | DismissedBanners
  | LegacyDismissedBannerRecord
  | LegacyDismissedBannerIds

/**
 * What a dismissal means for a given banner: `ttl` lets it resurface once that
 * many ms have elapsed, `permanent` keeps it hidden for good.
 */
export type BannerDismissPolicy = { ttl: number } | { permanent: null }

/**
 * Per-banner dismissal policy, assigned here next to the scope so a banner's
 * whole dismiss behaviour reads from one place rather than leaking into the
 * carousel. These are the local fallback: notification#33 settled that banners
 * are not served from the notification service, so there is no remote policy to
 * override them.
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
  // A campaign whose claim keeps its own entry point on the QBTC chain page, so
  // a closed card has nothing to come back for. This was a 7d TTL only because
  // dismissals were stored per profile (#4769) and a dismissal on a vault with
  // nothing to claim would have hidden it on a vault that could; #4770 scoped it
  // to the vault, so the reason for the TTL is gone.
  qbtcClaim: { permanent: null },
}

/**
 * What a dismissal applies to: the whole profile, or only the vault it was made
 * on. Assigned here next to the TTL rather than in carousel logic, so a banner's
 * whole dismiss behaviour reads from one place.
 */
type BannerDismissScope = 'global' | 'vault'

/**
 * A banner whose visibility is decided from the current vault takes `vault`.
 * Anything else - a campaign that is the same on every vault - takes `global`.
 *
 * Getting this wrong in the `global` direction is what #4769 was: a banner
 * dismissed on a vault it had nothing to offer stayed hidden on a vault that
 * qualified.
 */
const bannerDismissScope: Record<BannerId, BannerDismissScope> = {
  buyVultPromo: 'global',
  followOnX: 'global',
  migrate: 'global',
  agentNavigationCoachmark: 'global',
  rujiraStaking: 'global',
  kamino: 'global',
  // Gated on `vault.isBackedUp`.
  vaultBackup: 'vault',
  // Gated on the referral stored against this vault's id.
  referralCode: 'vault',
  // Gated on this vault's MLDSA key and its BTC address's claimable UTXOs.
  qbtcClaim: 'vault',
}

const emptyDismissedBanners: DismissedBanners = { global: {}, byVault: {} }

/**
 * Reads any stored shape into the current one. Legacy entries carry no vault,
 * so they land in `global`; a vault-scoped banner therefore ignores its old
 * profile-wide dismissal and may show once more per vault. Every vault-scoped
 * banner has a TTL of at most 7 days, so that costs a reappearance the user was
 * days away from anyway - cheaper than guessing which vault meant to dismiss it.
 */
type MigrateDismissedBannersInput = {
  stored: StoredDismissedBanners
  now: number
}

export const migrateDismissedBanners = ({
  stored,
  now,
}: MigrateDismissedBannersInput): DismissedBanners => {
  if (Array.isArray(stored)) {
    return {
      global: Object.fromEntries(stored.map(id => [id, { dismissedAt: now }])),
      byVault: {},
    }
  }

  if ('global' in stored) {
    return stored
  }

  return { global: stored, byVault: {} }
}

type IsBannerDismissedInput = {
  banners: DismissedBanners
  id: BannerId
  now: number
  vaultId: string
  policy?: Record<BannerId, BannerDismissPolicy>
}

/**
 * Whether a dismissal still hides the banner, read against the record its scope
 * names. A `permanent` policy hides it for good; a `ttl` policy only hides it
 * until that window has elapsed.
 */
export const isBannerDismissed = ({
  banners,
  id,
  now,
  vaultId,
  policy = bannerDismissPolicy,
}: IsBannerDismissedInput): boolean => {
  const dismissal = match(bannerDismissScope[id], {
    global: () => banners.global[id],
    vault: () => banners.byVault[vaultId]?.[id],
  })

  if (!dismissal) {
    return false
  }

  return matchRecordUnion<BannerDismissPolicy, boolean>(policy[id], {
    ttl: ms => now - dismissal.dismissedAt < ms,
    permanent: () => true,
  })
}

type RecordBannerDismissalInput = {
  banners: DismissedBanners
  id: BannerId
  now: number
  vaultId: string
}

/** Writes a dismissal into whichever record the banner's scope names. */
export const recordBannerDismissal = ({
  banners,
  id,
  now,
  vaultId,
}: RecordBannerDismissalInput): DismissedBanners => {
  const dismissal: BannerDismissal = { dismissedAt: now }

  return match(bannerDismissScope[id], {
    global: () => ({
      ...banners,
      global: { ...banners.global, [id]: dismissal },
    }),
    vault: () => ({
      ...banners,
      byVault: {
        ...banners.byVault,
        [vaultId]: { ...banners.byVault[vaultId], [id]: dismissal },
      },
    }),
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
      const migrated = migrateDismissedBanners({ stored, now: Date.now() })

      const needsRewrite = Array.isArray(stored)
        ? stored.length > 0
        : !('global' in stored)

      if (needsRewrite) {
        await setDismissedBanners(migrated)
      }

      return migrated
    },
    ...noRefetchQueryOptions,
  })
}

/**
 * Reports whether the stored dismissals have loaded, and answers whether a
 * given banner counts as dismissed - against the whole profile or against the
 * current vault, whichever that banner's scope names.
 */
export const useDismissedBanners = () => {
  const { data } = useDismissedBannersQuery()
  const vaultId = useAssertCurrentVaultId()

  return {
    hasLoaded: data !== undefined,
    isBannerDismissed: (id: BannerId) =>
      isBannerDismissed({
        banners: data || emptyDismissedBanners,
        id,
        now: Date.now(),
        vaultId,
      }),
  }
}

const useDismissBannerMutation = () => {
  const { getDismissedBanners, setDismissedBanners } = useCore()
  const refetchQueries = useRefetchQueries()
  const vaultId = useAssertCurrentVaultId()

  const mutationFn = async (bannerId: BannerId) => {
    // Read the latest stored state at mutation time rather than merging against
    // a render-time snapshot, so quick successive dismissals don't drop each
    // other's entries.
    const current = migrateDismissedBanners({
      stored: await getDismissedBanners(),
      now: Date.now(),
    })

    await setDismissedBanners(
      recordBannerDismissal({
        banners: current,
        id: bannerId,
        now: Date.now(),
        vaultId,
      })
    )
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
