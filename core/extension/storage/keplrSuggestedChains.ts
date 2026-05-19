import { StorageKey } from '@core/ui/storage/StorageKey'
import { ChainInfo } from '@keplr-wallet/types'
import { getStorageValue } from '@lib/extension/storage/get'
import { setStorageValue } from '@lib/extension/storage/set'

let mutationChain: Promise<unknown> = Promise.resolve()

const serialize = <T>(fn: () => Promise<T>): Promise<T> => {
  const next = mutationChain.then(fn, fn)
  mutationChain = next.catch(() => undefined)
  return next
}

export type KeplrSuggestedChainsRecord = Record<string, ChainInfo>

// Per-vault registry of dApp-suggested chains. Scoped to vaultId so a chain
// the user approved while using one vault doesn't silently leak into another
// vault's session — a key-import vault may not even hold the secp256k1 key
// the suggested chain would derive from.
type VaultsKeplrSuggestedChains = Record<string, KeplrSuggestedChainsRecord>

const allInitialValue: VaultsKeplrSuggestedChains = {}

const getAll = (): Promise<VaultsKeplrSuggestedChains> =>
  getStorageValue<VaultsKeplrSuggestedChains>(
    StorageKey.keplrSuggestedChains,
    allInitialValue
  )

export const getKeplrSuggestedChainsForVault = async (
  vaultId: string
): Promise<KeplrSuggestedChainsRecord> => {
  const all = await getAll()
  return all[vaultId] ?? {}
}

type AddInput = { vaultId: string; chainInfo: ChainInfo }

export const addKeplrSuggestedChainForVault = ({
  vaultId,
  chainInfo,
}: AddInput): Promise<void> =>
  serialize(async () => {
    const all = await getAll()
    const forVault = all[vaultId] ?? {}
    if (forVault[chainInfo.chainId]) return
    await setStorageValue<VaultsKeplrSuggestedChains>(
      StorageKey.keplrSuggestedChains,
      {
        ...all,
        [vaultId]: { ...forVault, [chainInfo.chainId]: chainInfo },
      }
    )
  })
