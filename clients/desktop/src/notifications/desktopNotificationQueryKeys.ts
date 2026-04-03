/**
 * React Query key prefix for whether the current vault is registered for desktop
 * push notifications. Combined with vault ECDSA public key and chain code in
 * query keys; value is stable for the lifetime of the app (string literal).
 */
export const desktopPushRegistrationQueryKey =
  'desktopPushNotificationRegistered'
