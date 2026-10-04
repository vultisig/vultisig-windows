import { storage } from '@core/extension/storage'
import {
  addKeplrSuggestedChainForHost,
  getKeplrSuggestedChainsForHost,
  KeplrSuggestedChainsRecord,
} from '@core/extension/storage/keplrSuggestedChains'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'
import { getUrlBaseDomain } from '@vultisig/lib-utils/url/baseDomain'

import { validateSuggestedChainInfo } from '../../keplr/validateSuggestedChainInfo'
import { callPopupFromBackground } from '../../popup/resolvers/background'

const emptyRecord: KeplrSuggestedChainsRecord = {}

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
 */
export const suggestKeplrChain: BackgroundResolver<
  'suggestKeplrChain'
> = async ({ input: { chainInfo }, context }) => {
  validateSuggestedChainInfo(chainInfo)

  const vaultId = await storage.getCurrentVaultId()
  if (!vaultId) return

  const host = getUrlBaseDomain(context.requestOrigin)
  const existing = await getKeplrSuggestedChainsForHost({ vaultId, host })
  if (existing[chainInfo.chainId]) return

  await callPopupFromBackground({
    call: { suggestKeplrChain: { chainInfo } },
    options: {},
    context,
  })

  await addKeplrSuggestedChainForHost({ vaultId, host, chainInfo })
}
