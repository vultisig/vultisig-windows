import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

const firefoxNotificationTokenStorageKey = 'vultisig_firefox_notification_token'

/**
 * Get or create the per-install device token used by the Firefox extension to
 * authenticate `/register`, `/unregister`, and `/ws` calls against the
 * notification server (mirrors the desktop UUID token; Firefox has no service
 * worker / Web Push subscription token to reuse).
 */
export const getOrCreateFirefoxNotificationToken =
  async (): Promise<string> => {
    const existing = await getStorageValue<string | null>(
      firefoxNotificationTokenStorageKey,
      null
    )
    if (existing) return existing

    const token = crypto.randomUUID()
    await setStorageValue(firefoxNotificationTokenStorageKey, token)
    return token
  }
