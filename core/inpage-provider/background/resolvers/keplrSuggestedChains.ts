import { storage } from '@core/extension/storage'
import {
  addKeplrSuggestedChainForHost,
  getKeplrSuggestedChainsForHost,
  KeplrSuggestedChainsRecord,
} from '@core/extension/storage/keplrSuggestedChains'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'

import { validateSuggestedChainInfo } from '../../keplr/validateSuggestedChainInfo'
import { callPopupFromBackground } from '../../popup/resolvers/background'

const emptyRecord: KeplrSuggestedChainsRecord = {}

const getRequiredCurrentVaultId = async () =>
  shouldBePresent(await storage.getCurrentVaultId(), 'currentVaultId')

/** Suggested chains the user approved for the requesting site. */
export const getKeplrSuggestedChains: BackgroundResolver<
  'getKeplrSuggestedChains'
> = async ({ context: { requestOrigin } }) => {
  const vaultId = await storage.getCurrentVaultId()
  if (!vaultId) return emptyRecord
  return getKeplrSuggestedChainsForHost({
    vaultId,
    host: getUrlBaseDomain(requestOrigin),
  })
}

/**
 * Registers a chain a site suggested, but only after the user approves the
 * `suggestKeplrChain` popup this resolver opens itself. The approval can't be
 * left to the inpage provider: a page can post bridge messages directly and
 * skip it. A chain the site already registered resolves without a popup.
 * The chain is stored under the vault selected when the user approves, which
 * is the one the site's follow-up `enable` reads.
 */
export const suggestKeplrChain: BackgroundResolver<
  'suggestKeplrChain'
> = async ({ input: { chainInfo }, context }) => {
  validateSuggestedChainInfo(chainInfo)

  const host = getUrlBaseDomain(context.requestOrigin)
  const existing = await getKeplrSuggestedChainsForHost({
    vaultId: await getRequiredCurrentVaultId(),
    host,
  })
  if (Object.prototype.hasOwnProperty.call(existing, chainInfo.chainId)) return

  await callPopupFromBackground({
    call: { suggestKeplrChain: { chainInfo } },
    options: {},
    context,
  })

  // The selected vault can change while the popup waits in the queue — an
  // earlier connection popup selects one — or while it's open, so read it
  // again rather than reuse the one from before the wait.
  await addKeplrSuggestedChainForHost({
    vaultId: await getRequiredCurrentVaultId(),
    host,
    chainInfo,
  })
}
