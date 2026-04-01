import { rootApiUrl } from '@vultisig/core-config'

/** Web Push registration, unregister, and VAPID (browser extension). */
export const pushNotificationServerUrl = `${rootApiUrl}/push`

/** Keysign device notify (`POST …/notify`) — matches iOS notification base URL. */
export const notificationApiServerUrl = `${rootApiUrl}/notification`
