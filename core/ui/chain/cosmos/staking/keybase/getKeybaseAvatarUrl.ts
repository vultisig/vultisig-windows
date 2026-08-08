/**
 * Resolves a Cosmos validator's avatar from Keybase via the validator's
 * `description.identity` (16-char hex PGP key fingerprint suffix).
 *
 * Endpoint:
 *   GET https://keybase.io/_/api/1.0/user/lookup.json
 *     ?key_suffix=<identity>&fields=pictures
 *
 * Returns the primary picture URL when the validator has registered a
 * Keybase profile with a picture. Returns `null` when:
 *   - the identity is empty (caller should skip the query),
 *   - Keybase doesn't know that identity (`status.code !== 0`),
 *   - the user has no profile picture,
 *   - the network/response is malformed.
 *
 * Never throws on a non-2xx — the caller should fall back to the
 * deterministic initial avatar in every "no URL" outcome, including
 * network errors and rate limits.
 */
export const getKeybaseAvatarUrl = async (
  identity: string,
  opts: { fetchImpl?: typeof fetch; signal?: AbortSignal } = {}
): Promise<string | null> => {
  if (!identity) return null
  const f = opts.fetchImpl ?? fetch

  const url = `https://keybase.io/_/api/1.0/user/lookup.json?key_suffix=${encodeURIComponent(identity)}&fields=pictures`

  try {
    const res = await f(url, { signal: opts.signal })
    if (!res.ok) return null
    const body = (await res.json()) as {
      status?: { code?: number }
      them?: ReadonlyArray<{
        pictures?: { primary?: { url?: string } }
      }>
    }
    if (body.status?.code !== 0) return null
    const them = body.them?.[0]
    const picture = them?.pictures?.primary?.url
    return typeof picture === 'string' && picture.length > 0 ? picture : null
  } catch {
    // Network error, abort, JSON parse failure — caller falls back to initial.
    return null
  }
}
