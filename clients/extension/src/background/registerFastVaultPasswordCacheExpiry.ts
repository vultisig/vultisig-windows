import {
  fastVaultPasswordCacheAlarmName,
  pruneExpiredVaultPasswords,
} from '@core/ui/mpc/fast/passwordCache'

/**
 * Expires the fast-vault password cache when its TTL elapses with no extension
 * UI open to run the in-context timer. The alarm is scheduled only while
 * something is cached, so nothing wakes the worker on an idle browser.
 */
export const registerFastVaultPasswordCacheExpiry = (): void => {
  chrome.alarms.onAlarm.addListener(alarm => {
    if (alarm.name !== fastVaultPasswordCacheAlarmName) {
      return
    }

    pruneExpiredVaultPasswords().catch(console.error)
  })
}
