/** Matches a link whose host is `route`, e.g. `vultisig://send?…`. */
export const deeplinkRoutePattern = (route: 'send') =>
  new RegExp(`^[a-z]+://${route}\\?`, 'i')
