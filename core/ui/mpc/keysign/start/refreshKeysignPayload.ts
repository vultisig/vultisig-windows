/**
 * The slice of a React Query result this refresh needs. Every keysign payload
 * query is a `useQuery` result, so `refetch` is always there — it is required
 * rather than optional so a query that cannot be refreshed fails to compile
 * instead of silently signing a stale payload.
 *
 * Generic because the queries differ in what they build: most produce a
 * `KeysignPayload`, while the QBTC vote query produces a whole
 * `KeysignMessagePayload`.
 */
export type RefetchableKeysignPayloadQuery<T> = {
  refetch: () => Promise<{
    data?: T | undefined
    error?: unknown
  }>
}

/**
 * Rebuilds the keysign payload at the moment signing starts.
 *
 * Every keysign payload query disables automatic refetching, so the payload the
 * review screen holds was built when that screen mounted. The SDK's fail-closed
 * gates live *inside* the builders — THORChain's advanced-swap-queue mimir, the
 * inbound halt flags, the router's `depositWithExpiry` deadline — which makes
 * them mount-time checks unless the payload is rebuilt here. A review long
 * enough for the queue to be disabled, a chain to halt, or a 15-minute router
 * expiry to lapse would otherwise sign a payload those gates would now reject.
 *
 * Manual `refetch()` still runs while `refetchOnMount`/`OnWindowFocus`/
 * `OnReconnect` are off, so this re-runs the builder and re-evaluates them.
 *
 * Throws when the rebuild fails or yields nothing: the caller must surface that
 * and abandon the ceremony rather than fall back to the payload it already had,
 * which is exactly the payload whose freshness is in doubt.
 */
export const refreshKeysignPayload = async <T>({
  refetch,
}: RefetchableKeysignPayloadQuery<T>): Promise<T> => {
  const { data, error } = await refetch()

  if (error) {
    throw error
  }

  if (!data) {
    throw new Error('Keysign payload could not be rebuilt')
  }

  return data
}
