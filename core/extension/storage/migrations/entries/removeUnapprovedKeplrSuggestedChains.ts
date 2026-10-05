import { removeStorageValue } from '@lib/extension/storage/remove'

const legacyKeplrSuggestedChainsKey = 'keplrSuggestedChains'

/**
 * Drops the pre-#5116 suggested-chain registry. Any site could write to it
 * without the user approving a popup, so its entries can't be trusted; dApps
 * suggest their chains again and the user approves them per site.
 */
export const removeUnapprovedKeplrSuggestedChains = async (): Promise<void> => {
  await removeStorageValue(legacyKeplrSuggestedChainsKey)
}
