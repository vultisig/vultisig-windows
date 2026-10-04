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

/** Suggested chains one site registered, keyed by chainId. */
export type KeplrSuggestedChainsRecord = Record<string, ChainInfo>

// Registry of dApp-suggested chains, scoped to vaultId and then to the
// requesting site's host. Vault scoping keeps a chain approved under one vault
// out of another vault's session — a key-import vault may not even hold the
// secp256k1 key the suggested chain would derive from. Host scoping keeps one
// site from deciding the chain info, bech32 prefix and endpoints another site
// gets for the same chainId.
type VaultsKeplrSuggestedChains = Record<
  string,
  Record<string, KeplrSuggestedChainsRecord>
>

const allInitialValue: VaultsKeplrSuggestedChains = {}

const getAll = (): Promise<VaultsKeplrSuggestedChains> =>
  getStorageValue<VaultsKeplrSuggestedChains>(
    StorageKey.keplrSuggestedChainsByHost,
    allInitialValue
  )

type KeplrSuggestedChainsScope = { vaultId: string; host: string }

/** Suggested chains the user approved for this host under this vault. */
export const getKeplrSuggestedChainsForHost = async ({
  vaultId,
  host,
}: KeplrSuggestedChainsScope): Promise<KeplrSuggestedChainsRecord> => {
  const all = await getAll()
  return all[vaultId]?.[host] ?? {}
}

type AddKeplrSuggestedChainForHostInput = KeplrSuggestedChainsScope & {
  chainInfo: ChainInfo
}

/**
 * Persists a chain the user approved for this host under this vault. The
 * first entry for a chainId wins, so a repeated approval never replaces it.
 */
export const addKeplrSuggestedChainForHost = ({
  vaultId,
  host,
  chainInfo,
}: AddKeplrSuggestedChainForHostInput): Promise<void> =>
  serialize(async () => {
    const all = await getAll()
    const forVault = all[vaultId] ?? {}
    const forHost = forVault[host] ?? {}
    if (forHost[chainInfo.chainId]) return
    await setStorageValue<VaultsKeplrSuggestedChains>(
      StorageKey.keplrSuggestedChainsByHost,
      {
        ...all,
        [vaultId]: {
          ...forVault,
          [host]: { ...forHost, [chainInfo.chainId]: chainInfo },
        },
      }
    )
  })
