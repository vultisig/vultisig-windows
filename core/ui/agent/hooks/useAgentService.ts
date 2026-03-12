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
import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useRef } from 'react'

import { AgentOrchestrator } from '../orchestrator'
import { getAgentConversationsQueryKey } from '../queries/queryKeys'
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

function toOrchestratorVaultData(vault: Vault) {
  return {
    name: vault.name,
    publicKeyEcdsa: vault.publicKeys.ecdsa,
    publicKeyEddsa: vault.publicKeys.eddsa,
    hexChainCode: vault.hexChainCode,
    localPartyId: vault.localPartyId,
    resharePrefix: vault.resharePrefix ?? '',
    libType: vault.libType,
    signers: vault.signers,
    keyShares: [
      {
        publicKey: vault.publicKeys.ecdsa,
        keyShare: vault.keyShares.ecdsa,
      },
      {
        publicKey: vault.publicKeys.eddsa,
        keyShare: vault.keyShares.eddsa,
      },
    ],
  }
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

const prependConversation = (
  conversations: Conversation[] | undefined,
  conversation: Conversation
): Conversation[] => [
  conversation,
  ...(conversations ?? []).filter(item => item.id !== conversation.id),
]

const touchConversation = (
  conversations: Conversation[] | undefined,
  conversationId: string,
  updatedAt: string
): Conversation[] | undefined => {
  if (!conversations) return conversations

  const conversation = conversations.find(item => item.id === conversationId)
  if (!conversation) return conversations

  return prependConversation(conversations, {
    ...conversation,
    updated_at: updatedAt,
  })
}

const renameConversation = (
  conversations: Conversation[] | undefined,
  conversationId: string,
  title: string
): Conversation[] | undefined => {
  if (!conversations) return conversations

  return conversations.map(item =>
    item.id === conversationId ? { ...item, title } : item
  )
}

export const useAgentService = (): UseAgentServiceReturn => {
  const core = useCore()
  const vault = useCurrentVault()
  const walletCore = useAssertWalletCore()
  const navigate = useNavigate<CoreView>()
  const refetchQueries = useRefetchQueries()
  const queryClient = useQueryClient()

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
          return toOrchestratorVaultData(current)
        }
        const vaults = await coreRef.current.getVaults()
        const v = vaults.find(v => getVaultId(v) === pubKey)
        if (!v) throw new Error('vault not found')
        return toOrchestratorVaultData(v)
      },
      getVaults: async () => {
        const vaults = await coreRef.current.getVaults()
        return vaults.map(toOrchestratorVaultData)
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
    methodsRef.current = {
      sendMessage: async (vaultPubKey, message) => {
        const conversationId = await orch.sendMessage({ vaultPubKey, message })
        const now = new Date().toISOString()

        queryClient.setQueryData<Conversation[]>(
          getAgentConversationsQueryKey(vaultPubKey),
          current =>
            prependConversation(current, {
              id: conversationId,
              public_key: vaultPubKey,
              created_at: now,
              updated_at: now,
            })
        )

        return conversationId
      },
      sendMessageToConversation: async (convId, vaultPubKey, message) => {
        await orch.sendMessageToConversation({ convId, vaultPubKey, message })
        const now = new Date().toISOString()

        queryClient.setQueryData<Conversation[]>(
          getAgentConversationsQueryKey(vaultPubKey),
          current => touchConversation(current, convId, now)
        )
      },
      createConversation: async vaultPubKey => {
        const conversationId = await orch.createConversation(vaultPubKey)
        const now = new Date().toISOString()

        queryClient.setQueryData<Conversation[]>(
          getAgentConversationsQueryKey(vaultPubKey),
          current =>
            prependConversation(current, {
              id: conversationId,
              public_key: vaultPubKey,
              created_at: now,
              updated_at: now,
            })
        )

        return conversationId
      },
      getConversations: vaultPubKey => orch.getConversations(vaultPubKey),
      getConversation: (convId, vaultPubKey) =>
        orch.getConversation({ convId, vaultPubKey }),
      deleteConversation: async (convId, vaultPubKey) => {
        await orch.deleteConversation({ convId, vaultPubKey })

        queryClient.setQueryData<Conversation[]>(
          getAgentConversationsQueryKey(vaultPubKey),
          current => (current ?? []).filter(item => item.id !== convId)
        )
      },
      cancelRequest: () => orch.cancelRequest(),
      providePassword: password => orch.providePassword(password),
      provideConfirmation: confirmed => orch.provideConfirmation(confirmed),
      checkServices: vaultPubKey => orch.checkServices(vaultPubKey),
      getVerifierSignInStatus: vaultPubKey => orch.isSignedIn(vaultPubKey),
      signIn: (vaultPubKey, password) => orch.signIn({ vaultPubKey, password }),
      getConversationStarters: vaultPubKey =>
        orch.getConversationStarters(vaultPubKey),
      preloadContext: vaultPubKey => orch.preloadContext(vaultPubKey),
      orchestrator: orch,
    }
  }

  useEffect(() => {
    const orch = methodsRef.current.orchestrator

    return orch.events.on('title_updated', ({ conversationId, title }) => {
      const currentVault = vaultRef.current
      if (!currentVault) return

      queryClient.setQueryData<Conversation[]>(
        getAgentConversationsQueryKey(getVaultId(currentVault)),
        current => renameConversation(current, conversationId, title)
      )
    })
  }, [queryClient])

  return methodsRef.current
}
