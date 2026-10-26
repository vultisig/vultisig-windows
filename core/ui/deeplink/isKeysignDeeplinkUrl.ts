import { getRawQueryParams } from '@vultisig/lib-utils/query/getRawQueryParams'

import { deeplinkRoutePattern } from './core'

/**
 * Tells whether a pushed payload is a keysign link. Push notifications only
 * ever open keysign; a pushed send or deposit link is never followed.
 */
export const isKeysignDeeplinkUrl = (url: string) =>
  !deeplinkRoutePattern('send').test(url) &&
  !deeplinkRoutePattern('deposit').test(url) &&
  getRawQueryParams<{ type?: string }>(url).type === 'SignTransaction'
