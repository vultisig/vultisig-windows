import { KeysignMessagePayload } from '@vultisig/core-mpc/keysign/keysignPayload/KeysignMessagePayload'
import { attempt } from '@vultisig/lib-utils/attempt'
import { extractErrorMsg } from '@vultisig/lib-utils/error/extractErrorMsg'

import {
  RefetchableKeysignPayloadQuery,
  refreshKeysignPayload,
} from './refreshKeysignPayload'

type GetKeysignPayloadToSignInput<T> = {
  query: RefetchableKeysignPayloadQuery<T>
  /** Wraps what the query builds into the payload the ceremony consumes. */
  toKeysignPayload: (data: T) => KeysignMessagePayload
  /** Reports why signing was refused, for display on the review screen. */
  onError: (message: string) => void
}

/**
 * The payload to hand to the keysign ceremony, rebuilt at the moment signing
 * starts, or `null` when it could not be rebuilt.
 *
 * Returning `null` rather than the payload the review screen already holds is
 * the whole point: that payload was built at mount, and a builder gate now
 * rejecting it (advanced-swap queue disabled, chain halted, router expiry
 * lapsed) is precisely the case where signing it anyway would be wrong.
 */
export const getKeysignPayloadToSign = async <T>({
  query,
  toKeysignPayload,
  onError,
}: GetKeysignPayloadToSignInput<T>): Promise<KeysignMessagePayload | null> => {
  const result = await attempt(() => refreshKeysignPayload(query))

  if ('error' in result) {
    onError(extractErrorMsg(result.error))
    return null
  }

  return toKeysignPayload(result.data)
}
