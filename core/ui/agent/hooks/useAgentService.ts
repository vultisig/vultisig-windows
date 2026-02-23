import { Chain } from '@core/chain/Chain'
import { CoinKey } from '@core/chain/coin/Coin'
import { getVaultId, Vault } from '@core/mpc/vault/Vault'
import { useAssertWalletCore } from '@core/ui/chain/providers/WalletCoreProvider'
import { CoreView } from '@core/ui/navigation/CoreView'
import { useCore } from '@core/ui/state/core'
import { StorageKey } from '@core/ui/storage/StorageKey'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { useNavigate } from '@lib/ui/navigation/hooks/useNavigate'
import { useRefetchQueries } from '@lib/ui/query/hooks/useRefetchQueries'
import { useEffect, useRef } from 'react'

import { AgentOrchestrator } from '../orchestrator'
import { setStorageContext } from '../tools/shared/storageContext'
import { setWalletContext } from '../tools/shared/walletContext'
import type {
  Conversation,
  ConversationWithMessages,
  ServiceStatus,
} from '../types'

let orchestratorSingleton: AgentOrchestrator | null = null

function getOrCreateOrchestrator(
  deps: ConstructorParameters<typeof AgentOrchestrator>[0]
): AgentOrchestrator {
  if (!orchestratorSingleton) {
    orchestratorSingleton = new AgentOrchestrator(deps)
  }
  return orchestratorSingleton
}

type NavigationData = {
  id: string
  state?: Record<string, unknown>
}

function buildCoinKey(coin: { chain: string; id?: string }): CoinKey {
  const result: { chain: Chain; id?: string } = {
    chain: coin.chain as Chain,
  }
  if (coin.id) {
    result.id = coin.id
  }
  return result
}

function processNavigation(
  nav: NavigationData,
  vault: Vault | undefined
): CoreView | null {
  if (nav.id === 'send') {
    const state = nav.state ?? {}
    const coin = state.coin as { chain: string; id?: string } | undefined
    if (!coin) return null

    const coinKey = buildCoinKey(coin)
    const vaultCoins =
      (vault as Vault & { coins?: Array<{ chain: string; id?: string }> })
        ?.coins ?? []
    const coinExists = vaultCoins.some(
      vc =>
        vc.chain === coinKey.chain &&
        vc.id?.toLowerCase() === coinKey.id?.toLowerCase()
    )
    if (!coinExists) return null

    const amountStr = state.amount as string | undefined
    let amount: bigint | undefined
    if (amountStr && /^\d+$/.test(String(amountStr))) {
      amount = BigInt(amountStr)
    }
    const hasAllSendParams = amount && state.address
    return {
      id: 'send',
      state: {
        coin: coinKey,
        address: state.address as string | undefined,
        amount,
        memo: state.memo as string | undefined,
        skipToVerify: hasAllSendParams ? true : undefined,
      },
    }
  }

  return null
}

type UseAgentServiceReturn = {
  sendMessage: (vaultPubKey: string, message: string) => Promise<string>
  sendMessageToConversation: (
    convID: string,
    vaultPubKey: string,
    message: string
  ) => Promise<void>
  createConversation: (vaultPubKey: string) => Promise<string>
  getConversations: (vaultPubKey: string) => Promise<Conversation[]>
  getConversation: (
    convID: string,
    vaultPubKey: string
  ) => Promise<ConversationWithMessages>
  deleteConversation: (convID: string, vaultPubKey: string) => Promise<void>
  cancelRequest: () => void
  providePassword: (password: string) => void
  provideConfirmation: (confirmed: boolean) => void
  checkServices: (vaultPubKey: string) => Promise<ServiceStatus>
  getVerifierSignInStatus: (vaultPubKey: string) => boolean
  signIn: (vaultPubKey: string, password: string) => Promise<void>
  getConversationStarters: (vaultPubKey: string) => Promise<string[]>
  preloadContext: (vaultPubKey: string) => Promise<void>
  orchestrator: AgentOrchestrator
}

function buildMethods(orch: AgentOrchestrator): UseAgentServiceReturn {
  return {
    sendMessage: (vaultPubKey, message) =>
      orch.sendMessage(vaultPubKey, message),
    sendMessageToConversation: (convID, vaultPubKey, message) =>
      orch.sendMessageToConversation(convID, vaultPubKey, message),
    createConversation: vaultPubKey => orch.createConversation(vaultPubKey),
    getConversations: vaultPubKey => orch.getConversations(vaultPubKey),
    getConversation: (convID, vaultPubKey) =>
      orch.getConversation(convID, vaultPubKey),
    deleteConversation: (convID, vaultPubKey) =>
      orch.deleteConversation(convID, vaultPubKey),
    cancelRequest: () => orch.cancelRequest(),
    providePassword: password => orch.providePassword(password),
    provideConfirmation: confirmed => orch.provideConfirmation(confirmed),
    checkServices: vaultPubKey => orch.checkServices(vaultPubKey),
    getVerifierSignInStatus: vaultPubKey => orch.isSignedIn(vaultPubKey),
    signIn: (vaultPubKey, password) => orch.signIn(vaultPubKey, password),
    getConversationStarters: vaultPubKey =>
      orch.getConversationStarters(vaultPubKey),
    preloadContext: vaultPubKey => orch.preloadContext(vaultPubKey),
    orchestrator: orch,
  }
}

export const useAgentService = (): UseAgentServiceReturn => {
  const core = useCore()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const navigate = useNavigate<CoreView>()
  const refetchQueries = useRefetchQueries()

  const navigateRef = useRef(navigate)
  navigateRef.current = navigate
  const vaultRef = useRef(vault)
  vaultRef.current = vault
  const refetchRef = useRef(refetchQueries)
  refetchRef.current = refetchQueries
  const coreRef = useRef(core)
  coreRef.current = core

  useEffect(() => {
    setStorageContext(core)
    return () => setStorageContext(null)
  }, [core])

  useEffect(() => {
    if (vault && walletCore) {
      setWalletContext({
        walletCore,
        vault: {
          hexChainCode: vault.hexChainCode,
          publicKeys: vault.publicKeys,
          chainPublicKeys: vault.chainPublicKeys,
          localPartyId: vault.localPartyId,
          libType: vault.libType,
          publicKeyEcdsa: vault.publicKeys.ecdsa,
        },
      })
    }
    return () => setWalletContext(null)
  }, [vault, walletCore])

  const methodsRef = useRef<UseAgentServiceReturn>(null!)
  if (!methodsRef.current) {
    const orch = getOrCreateOrchestrator({
      getVault: async (pubKey: string) => {
        const current = vaultRef.current
        if (current && getVaultId(current) === pubKey) {
          return {
            name: current.name,
            publicKeyEcdsa: current.publicKeys.ecdsa,
            publicKeyEddsa: current.publicKeys.eddsa,
            hexChainCode: current.hexChainCode,
            localPartyId: current.localPartyId,
            resharePrefix: current.resharePrefix ?? '',
            libType: current.libType,
            signers: current.signers,
            keyShares: [
              {
                publicKey: current.publicKeys.ecdsa,
                keyShare: current.keyShares.ecdsa,
              },
              {
                publicKey: current.publicKeys.eddsa,
                keyShare: current.keyShares.eddsa,
              },
            ],
          }
        }
        const vaults = await coreRef.current.getVaults()
        const v = vaults.find(v => getVaultId(v) === pubKey)
        if (!v) throw new Error('vault not found')
        return {
          name: v.name,
          publicKeyEcdsa: v.publicKeys.ecdsa,
          publicKeyEddsa: v.publicKeys.eddsa,
          hexChainCode: v.hexChainCode,
          localPartyId: v.localPartyId,
          resharePrefix: v.resharePrefix ?? '',
          libType: v.libType,
          signers: v.signers,
          keyShares: [
            { publicKey: v.publicKeys.ecdsa, keyShare: v.keyShares.ecdsa },
            { publicKey: v.publicKeys.eddsa, keyShare: v.keyShares.eddsa },
          ],
        }
      },
      getVaultCoins: async (pubKey: string) => {
        const allCoins = await coreRef.current.getCoins()
        const coins = allCoins[pubKey] ?? []
        return coins.map(c => ({
          chain: c.chain,
          ticker: c.ticker,
          address: c.address,
          contractAddress: c.id,
          decimals: c.decimals,
          logo: c.logo,
          priceProviderId: c.priceProviderId,
          isNativeToken: !c.id,
          id: c.id,
        }))
      },
      getAddressBookItems: async () => {
        const items = await coreRef.current.getAddressBookItems()
        return items.map(item => ({
          title: item.title,
          address: item.address,
          chain: item.chain,
        }))
      },
      onNavigate: (nav: NavigationData) => {
        const view = processNavigation(nav, vaultRef.current)
        if (view) {
          navigateRef.current(view)
        }
      },
      onVaultDataChanged: () => {
        refetchRef.current([StorageKey.vaultsCoins], [StorageKey.vaults])
      },
    })
    methodsRef.current = buildMethods(orch)
  }

  return methodsRef.current
}
