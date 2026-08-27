import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { noRefetchQueryOptions } from '@lib/ui/query/utils/options'
import { useMutation, useQuery } from '@tanstack/react-query'
import { match } from '@vultisig/lib-utils/match'
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
 * Per-banner cooldown (in ms) after dismissal, after which the banner may show
 * again. Configurable per banner rather than hard-coded in carousel logic.
 */
export const bannerDismissalTtl: Record<BannerId, number> = {
  buyVultPromo: convertDuration(7, 'd', 'ms'),
  followOnX: convertDuration(15, 'd', 'ms'),
  migrate: convertDuration(15, 'd', 'ms'),
  agentNavigationCoachmark: convertDuration(15, 'd', 'ms'),
  rujiraStaking: convertDuration(7, 'd', 'ms'),
  vaultBackup: convertDuration(7, 'd', 'ms'),
  referralCode: convertDuration(7, 'd', 'ms'),
  kamino: convertDuration(7, 'd', 'ms'),
  // Deliberately a TTL rather than a permanent dismissal: this banner is gated
  // on the current vault, but the dismissal is stored per profile (#4769), so a
  // dismissal on a vault with nothing to claim would otherwise hide the banner
  // for good on a vault that does have claimable UTXOs.
  qbtcClaim: convertDuration(7, 'd', 'ms'),
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
export const migrateDismissedBanners = (
  stored: StoredDismissedBanners,
  now: number
): DismissedBanners => {
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
}

/**
 * A banner counts as dismissed only while it is within its TTL window, and only
 * against the record its scope names. Once the TTL has elapsed the dismissal is
 * ignored and the banner can show again.
 */
export const isBannerDismissed = ({
  banners,
  id,
  now,
  vaultId,
}: IsBannerDismissedInput): boolean => {
  const dismissal = match(bannerDismissScope[id], {
    global: () => banners.global[id],
    vault: () => banners.byVault[vaultId]?.[id],
  })

  if (!dismissal) {
    return false
  }

  return now - dismissal.dismissedAt < bannerDismissalTtl[id]
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
      const migrated = migrateDismissedBanners(stored, Date.now())

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
    const current = migrateDismissedBanners(
      await getDismissedBanners(),
      Date.now()
    )

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
