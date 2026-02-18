import { useCallback, useState } from 'react'

import {
  Action,
  Conversation,
  ConversationWithMessages,
  ServiceStatus,
} from '../types'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    go: {
      agent: {
        AgentService: {
          SendMessage: (vaultPubKey: string, message: string) => Promise<string>
          SendMessageToConversation: (
            convID: string,
            vaultPubKey: string,
            message: string
          ) => Promise<void>
          ExecuteAction: (
            convID: string,
            vaultPubKey: string,
            actionJSON: string
          ) => Promise<void>
          SelectSuggestion: (
            convID: string,
            vaultPubKey: string,
            suggestionID: string
          ) => Promise<void>
          CreateConversation: (vaultPubKey: string) => Promise<string>
          GetConversations: (
            vaultPubKey: string
          ) => Promise<Conversation[]>
          GetConversation: (
            convID: string,
            vaultPubKey: string
          ) => Promise<ConversationWithMessages>
          DeleteConversation: (
            convID: string,
            vaultPubKey: string
          ) => Promise<void>
          CancelRequest: () => Promise<void>
          ProvidePassword: (password: string) => Promise<void>
          ProvideConfirmation: (confirmed: boolean) => Promise<void>
          GetVerifierSignInStatus: (vaultPubKey: string) => Promise<boolean>
          CheckServices: (vaultPubKey: string) => Promise<ServiceStatus>
          GetCachedAuthToken: (
            vaultPubKey: string
          ) => Promise<string>
          SignIn: (vaultPubKey: string, password: string) => Promise<void>
          GetAuthTokenInfo: (
            vaultPubKey: string
          ) => Promise<{ connected: boolean; expiresAt: string }>
          InvalidateAuthToken: (vaultPubKey: string) => Promise<void>
          Disconnect: (vaultPubKey: string) => Promise<void>
          PreloadContext: (vaultPubKey: string) => Promise<void>
          ProvideDKLSSignature: (
            requestId: string,
            r: string,
            s: string,
            recoveryId: string,
            error: string
          ) => Promise<void>
          ProvideDKLSReshare: (
            requestId: string,
            ecdsaPubKey: string,
            eddsaPubKey: string,
            ecdsaKeyshare: string,
            eddsaKeyshare: string,
            chaincode: string,
            error: string
          ) => Promise<void>
          ProvideChainAddress: (
            requestId: string,
            chain: string,
            address: string,
            ticker: string,
            decimals: number,
            logo: string,
            priceProviderId: string,
            error: string
          ) => Promise<void>
          ProvideBalance: (data: string) => Promise<void>
          ProvidePortfolio: (data: string) => Promise<void>
          ProvideToolResult: (data: string) => Promise<void>
        }
      }
      storage: {
        Store: {
          GetVaults: () => Promise<
            Array<{
              name: string
              publicKeyEcdsa: string
              [key: string]: unknown
            }>
          >
          GetVault: (pubKey: string) => Promise<{
            name: string
            publicKeyEcdsa: string
            [key: string]: unknown
          }>
          GetVaultCoins: (pubKey: string) => Promise<
            Array<{
              chain: string
              ticker: string
              address: string
              contractAddress: string
              decimals: number
              logo: string
              priceProviderId: string
              isNativeToken: boolean
              id: string
              [key: string]: unknown
            }>
          >
          GetCoins: () => Promise<
            Record<
              string,
              Array<{
                chain: string
                ticker: string
                address: string
                contractAddress: string
                decimals: number
                logo: string
                priceProviderId: string
                isNativeToken: boolean
                id: string
                [key: string]: unknown
              }>
            >
          >
          SaveVault: (vault: {
            name: string
            publicKeyEcdsa: string
            [key: string]: unknown
          }) => Promise<void>
          SaveCoin: (pubKey: string, coin: unknown) => Promise<string>
          DeleteCoin: (pubKey: string, coinId: string) => Promise<void>
          DeleteCoinsByChain: (pubKey: string, chain: string) => Promise<number>
          GetAllAddressBookItems: () => Promise<
            Array<{
              id: string
              title: string
              address: string
              chain: string
              order: number
              [key: string]: unknown
            }>
          >
          SaveAddressBookItem: (item: {
            id: string
            title: string
            address: string
            chain: string
            order: number
            [key: string]: unknown
          }) => Promise<string>
          DeleteAddressBookItem: (id: string) => Promise<void>
        }
      }
    }
  }
}

type UseAgentServiceReturn = {
  sendMessage: (vaultPubKey: string, message: string) => Promise<string>
  sendMessageToConversation: (
    convID: string,
    vaultPubKey: string,
    message: string
  ) => Promise<void>
  executeAction: (
    convID: string,
    vaultPubKey: string,
    action: Action
  ) => Promise<void>
  selectSuggestion: (
    convID: string,
    vaultPubKey: string,
    suggestionID: string
  ) => Promise<void>
  createConversation: (vaultPubKey: string) => Promise<string>
  getConversations: (vaultPubKey: string) => Promise<Conversation[]>
  getConversation: (
    convID: string,
    vaultPubKey: string
  ) => Promise<ConversationWithMessages>
  deleteConversation: (convID: string, vaultPubKey: string) => Promise<void>
  cancelRequest: () => Promise<void>
  providePassword: (password: string) => Promise<void>
  provideConfirmation: (confirmed: boolean) => Promise<void>
  checkServices: (vaultPubKey: string) => Promise<ServiceStatus>
  getVerifierSignInStatus: (vaultPubKey: string) => Promise<boolean>
  signIn: (vaultPubKey: string, password: string) => Promise<void>
  preloadContext: (vaultPubKey: string) => Promise<void>
  isLoading: boolean
  error: string | null
}

export const useAgentService = (): UseAgentServiceReturn => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const sendMessage = useCallback(
    async (vaultPubKey: string, message: string) => {
      setIsLoading(true)
      setError(null)
      try {
        const conversationId = await window.go.agent.AgentService.SendMessage(
          vaultPubKey,
          message
        )
        return conversationId
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const sendMessageToConversation = useCallback(
    async (convID: string, vaultPubKey: string, message: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await window.go.agent.AgentService.SendMessageToConversation(
          convID,
          vaultPubKey,
          message
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to send message'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const executeAction = useCallback(
    async (convID: string, vaultPubKey: string, action: Action) => {
      setIsLoading(true)
      setError(null)
      try {
        await window.go.agent.AgentService.ExecuteAction(
          convID,
          vaultPubKey,
          JSON.stringify(action)
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to execute action'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const selectSuggestion = useCallback(
    async (convID: string, vaultPubKey: string, suggestionID: string) => {
      setIsLoading(true)
      setError(null)
      try {
        await window.go.agent.AgentService.SelectSuggestion(
          convID,
          vaultPubKey,
          suggestionID
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to select suggestion'
        setError(errorMessage)
        throw err
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  const createConversation = useCallback(async (vaultPubKey: string) => {
    try {
      return await window.go.agent.AgentService.CreateConversation(vaultPubKey)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to create conversation'
      setError(errorMessage)
      throw err
    }
  }, [])

  const getConversations = useCallback(async (vaultPubKey: string) => {
    try {
      return await window.go.agent.AgentService.GetConversations(vaultPubKey)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to get conversations'
      setError(errorMessage)
      throw err
    }
  }, [])

  const getConversation = useCallback(
    async (convID: string, vaultPubKey: string) => {
      try {
        return await window.go.agent.AgentService.GetConversation(
          convID,
          vaultPubKey
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to get conversation'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const deleteConversation = useCallback(
    async (convID: string, vaultPubKey: string) => {
      try {
        await window.go.agent.AgentService.DeleteConversation(
          convID,
          vaultPubKey
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to delete conversation'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const cancelRequest = useCallback(async () => {
    try {
      await window.go.agent.AgentService.CancelRequest()
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to cancel request'
      setError(errorMessage)
      throw err
    }
  }, [])

  const providePassword = useCallback(async (password: string) => {
    try {
      await window.go.agent.AgentService.ProvidePassword(password)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to provide password'
      setError(errorMessage)
      throw err
    }
  }, [])

  const provideConfirmation = useCallback(async (confirmed: boolean) => {
    try {
      await window.go.agent.AgentService.ProvideConfirmation(confirmed)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to provide confirmation'
      setError(errorMessage)
      throw err
    }
  }, [])

  const getVerifierSignInStatus = useCallback(async (vaultPubKey: string) => {
    try {
      return await window.go.agent.AgentService.GetVerifierSignInStatus(
        vaultPubKey
      )
    } catch {
      return false
    }
  }, [])

  const signIn = useCallback(async (vaultPubKey: string, password: string) => {
    try {
      await window.go.agent.AgentService.SignIn(vaultPubKey, password)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to sign in'
      setError(errorMessage)
      throw err
    }
  }, [])

  const preloadContext = useCallback(async (vaultPubKey: string) => {
    try {
      await window.go.agent.AgentService.PreloadContext(vaultPubKey)
    } catch {
      // preload is best-effort
    }
  }, [])

  const checkServices = useCallback(async (vaultPubKey: string) => {
    return await window.go.agent.AgentService.CheckServices(vaultPubKey)
  }, [])

  return {
    sendMessage,
    sendMessageToConversation,
    executeAction,
    selectSuggestion,
    createConversation,
    getConversations,
    getConversation,
    deleteConversation,
    cancelRequest,
    providePassword,
    provideConfirmation,
    checkServices,
    getVerifierSignInStatus,
    signIn,
    preloadContext,
    isLoading,
    error,
  }
}
