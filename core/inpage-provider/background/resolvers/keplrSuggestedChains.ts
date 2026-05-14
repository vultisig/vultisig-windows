import { storage } from '@core/extension/storage'
import {
  addKeplrSuggestedChainForVault,
  getKeplrSuggestedChainsForVault,
  KeplrSuggestedChainsRecord,
} from '@core/extension/storage/keplrSuggestedChains'
import { BackgroundResolver } from '@core/inpage-provider/background/resolver'

const emptyRecord: KeplrSuggestedChainsRecord = {}

export const getKeplrSuggestedChains: BackgroundResolver<
  'getKeplrSuggestedChains'
> = async () => {
  const vaultId = await storage.getCurrentVaultId()
  if (!vaultId) return emptyRecord
  return getKeplrSuggestedChainsForVault(vaultId)
}

export const addKeplrSuggestedChain: BackgroundResolver<
  'addKeplrSuggestedChain'
> = async ({ input: { chainInfo } }) => {
  const vaultId = await storage.getCurrentVaultId()
  if (!vaultId) return
  await addKeplrSuggestedChainForVault({ vaultId, chainInfo })
}
