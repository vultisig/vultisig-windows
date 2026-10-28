import { deeplinkRoutePattern } from './core'
import { getDeeplinkQueryParams } from './getDeeplinkQueryParams'

/**
 * Tells whether a pushed payload is a keysign link. Push notifications only
 * ever open keysign; a pushed send or deposit link is never followed.
 */
export const isKeysignDeeplinkUrl = (url: string) =>
  !deeplinkRoutePattern('send').test(url) &&
  getDeeplinkQueryParams<{ type?: string }>(url).type === 'SignTransaction'
