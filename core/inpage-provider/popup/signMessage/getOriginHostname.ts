import { attempt } from '@vultisig/lib-utils/attempt'

/**
 * The hostname of an origin, or `undefined` for one without a hostname such
 * as the opaque `null` origin of a sandboxed frame.
 */
export const getOriginHostname = (origin: string): string | undefined => {
  const result = attempt(() => new URL(origin).hostname)

  return 'data' in result && result.data ? result.data : undefined
}
