import { useCallback, useState } from 'react'

import { Conversation } from '../types'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    go: {
      agent: {
        AgentService: {
          SendMessage: (vaultPubKey: string, message: string) => Promise<string>
          NewConversation: (
            vaultPubKey: string,
            name: string
          ) => Promise<string>
          GetConversation: (conversationId: string) => Promise<Conversation>
          GetConversations: (vaultPubKey: string) => Promise<Conversation[]>
          DeleteConversation: (conversationId: string) => Promise<void>
          UpdateConversationName: (
            conversationId: string,
            name: string
          ) => Promise<void>
          ClearHistory: (vaultPubKey: string) => Promise<void>
          CancelRequest: () => Promise<void>
          ProvidePassword: (password: string) => Promise<void>
          ProvideConfirmation: (confirmed: boolean) => Promise<void>
          GetApiKeyStatus: () => Promise<boolean>
          GetVerifierSignInStatus: (vaultPubKey: string) => Promise<boolean>
          SignIn: (vaultPubKey: string, password: string) => Promise<void>
          GetConversationStarters: (vaultPubKey: string) => Promise<string[]>
          GenerateConversationStarters: (vaultPubKey: string) => Promise<void>
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
        }
      }
    }
  }
}

type UseAgentServiceReturn = {
  sendMessage: (vaultPubKey: string, message: string) => Promise<string>
  newConversation: (vaultPubKey: string, name: string) => Promise<string>
  getConversations: (vaultPubKey: string) => Promise<Conversation[]>
  deleteConversation: (conversationId: string) => Promise<void>
  updateConversationName: (
    conversationId: string,
    name: string
  ) => Promise<void>
  clearHistory: (vaultPubKey: string) => Promise<void>
  cancelRequest: () => Promise<void>
  providePassword: (password: string) => Promise<void>
  provideConfirmation: (confirmed: boolean) => Promise<void>
  checkApiKey: () => Promise<boolean>
  getVerifierSignInStatus: (vaultPubKey: string) => Promise<boolean>
  signIn: (vaultPubKey: string, password: string) => Promise<void>
  getConversationStarters: (vaultPubKey: string) => Promise<string[]>
  generateConversationStarters: (vaultPubKey: string) => Promise<void>
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

  const newConversation = useCallback(
    async (vaultPubKey: string, name: string) => {
      try {
        return await window.go.agent.AgentService.NewConversation(
          vaultPubKey,
          name
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to create conversation'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

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

  const deleteConversation = useCallback(async (conversationId: string) => {
    try {
      await window.go.agent.AgentService.DeleteConversation(conversationId)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to delete conversation'
      setError(errorMessage)
      throw err
    }
  }, [])

  const updateConversationName = useCallback(
    async (conversationId: string, name: string) => {
      try {
        await window.go.agent.AgentService.UpdateConversationName(
          conversationId,
          name
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : 'Failed to update conversation name'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  const clearHistory = useCallback(async (vaultPubKey: string) => {
    try {
      await window.go.agent.AgentService.ClearHistory(vaultPubKey)
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to clear history'
      setError(errorMessage)
      throw err
    }
  }, [])

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

  const checkApiKey = useCallback(async () => {
    try {
      return await window.go.agent.AgentService.GetApiKeyStatus()
    } catch {
      return false
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

  const getConversationStarters = useCallback(async (vaultPubKey: string) => {
    try {
      return await window.go.agent.AgentService.GetConversationStarters(
        vaultPubKey
      )
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load starters'
      setError(errorMessage)
      throw err
    }
  }, [])

  const generateConversationStarters = useCallback(
    async (vaultPubKey: string) => {
      try {
        await window.go.agent.AgentService.GenerateConversationStarters(
          vaultPubKey
        )
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to generate starters'
        setError(errorMessage)
        throw err
      }
    },
    []
  )

  return {
    sendMessage,
    newConversation,
    getConversations,
    deleteConversation,
    updateConversationName,
    clearHistory,
    cancelRequest,
    providePassword,
    provideConfirmation,
    checkApiKey,
    getVerifierSignInStatus,
    signIn,
    getConversationStarters,
    generateConversationStarters,
    isLoading,
    error,
  }
}
