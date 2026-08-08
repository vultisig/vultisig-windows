import { useQuery } from '@tanstack/react-query'

import { getKeybaseAvatarUrl } from './getKeybaseAvatarUrl'

/**
 * Resolves a validator's Keybase avatar URL with React Query caching.
 *
 * Cached for 1 hour (`staleTime`) and never garbage-collected during the
 * session (`gcTime: Infinity`) — Keybase profile pictures are essentially
 * static, and validator identities are referenced across the picker and
 * every active-delegation card, so re-fetching would be pure waste.
 *
 * Skipped when `identity` is empty so the validator falls back to the
 * deterministic initial avatar without firing a redundant request.
 */
export const useKeybaseAvatarQuery = (identity: string | undefined) =>
  useQuery({
    queryKey: ['keybaseAvatar', identity ?? ''] as const,
    queryFn: () => getKeybaseAvatarUrl(identity ?? ''),
    enabled: Boolean(identity),
    staleTime: 60 * 60 * 1000,
    gcTime: Infinity,
    // A failed lookup (404, rate-limit, network error) is a confirmed
    // "no avatar" — retrying just delays the fallback render.
    retry: false,
  })
