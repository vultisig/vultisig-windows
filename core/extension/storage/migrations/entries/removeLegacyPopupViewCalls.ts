import { removeStorageValue } from '@lib/extension/storage/remove'

const legacyPopupViewCallsKey = 'popupViewCalls'

/**
 * Drops the pre-#5099 record that held every pending popup call under one
 * key. Pending calls now live under a key each, and whatever is left in the
 * old record belongs to popups that can no longer be answered.
 */
export const removeLegacyPopupViewCalls = async (): Promise<void> => {
  await removeStorageValue(legacyPopupViewCallsKey)
}
