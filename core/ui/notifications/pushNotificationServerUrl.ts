import { rootApiUrl } from '@vultisig/core-config'

/**
 * Web Push registration, unregister, and VAPID (browser extension).
 * Same base URL as `notificationApiServerUrl` — iOS uses `/notification` for all notification endpoints.
 */
export const pushNotificationServerUrl = `${rootApiUrl}/notification`

/** Keysign device notify (`POST …/notify`) — matches iOS notification base URL. */
export const notificationApiServerUrl = `${rootApiUrl}/notification`
