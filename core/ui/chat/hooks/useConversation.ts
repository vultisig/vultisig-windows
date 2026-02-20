import { useCallback, useEffect, useMemo, useState } from 'react'

import {
  ActionResult,
  InstallRequired,
  Message,
  PolicyReady,
  Suggestion,
} from '../state/chatTypes'
import { useChatApi, useGetConversation } from './useChatApi'
import { useWalletContext } from './useWalletContext'

type UseConversationOptions = {
  publicKey: string
  accessToken: string
}

export const useConversation = ({
  publicKey,
  accessToken,
}: UseConversationOptions) => {
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [installRequired, setInstallRequired] =
    useState<InstallRequired | null>(null)
  const [policyReady, setPolicyReady] = useState<PolicyReady | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const walletContext = useWalletContext()
  const chatApi = useChatApi({ publicKey, accessToken })

  // Query for current conversation
  const conversationQuery = useGetConversation(
    conversationId,
    publicKey,
    accessToken
  )

  // Sync messages from query
  useEffect(() => {
    if (conversationQuery.data?.messages) {
      setMessages(conversationQuery.data.messages)
    }
  }, [conversationQuery.data?.messages])

  // Create or load conversation on mount
  useEffect(() => {
    const initConversation = async () => {
      if (!publicKey || !accessToken) return
      if (conversationId) return

      // Check if there's an existing conversation
      const list = chatApi.listConversations.data
      if (list && list.conversations.length > 0) {
        // Use the most recent conversation
        setConversationId(list.conversations[0].id)
      }
    }

    initConversation()
  }, [publicKey, accessToken, conversationId, chatApi.listConversations.data])

  const startNewConversation = useCallback(async () => {
    setError(null)
    setIsLoading(true)
    try {
      const conversation = await chatApi.createConversation.mutateAsync()
      setConversationId(conversation.id)
      setMessages([])
      setSuggestions([])
      setInstallRequired(null)
      setPolicyReady(null)
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start conversation'
      )
    } finally {
      setIsLoading(false)
    }
  }, [chatApi.createConversation])

  const sendMessageToConversation = useCallback(
    async (convId: string, content: string) => {
      setError(null)
      setIsLoading(true)
      setSuggestions([])
      setInstallRequired(null)
      setPolicyReady(null)

      // Optimistically add user message
      const tempUserMessage: Message = {
        id: `temp-${Date.now()}`,
        conversation_id: convId,
        role: 'user',
        content,
        content_type: 'text',
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, tempUserMessage])

      try {
        const response = await chatApi.sendMessage.mutateAsync({
          conversationId: convId,
          content,
          context: walletContext,
        })

        // Replace temp message and add assistant response
        setMessages(prev => {
          const filtered = prev.filter(m => m.id !== tempUserMessage.id)
          // Add both user message (from server) and assistant message
          const userMessage: Message = {
            id: `user-${Date.now()}`,
            conversation_id: convId,
            role: 'user',
            content,
            content_type: 'text',
            created_at: new Date().toISOString(),
          }
          return [...filtered, userMessage, response.message]
        })

        if (response.suggestions) {
          setSuggestions(response.suggestions)
        }
        if (response.install_required) {
          setInstallRequired(response.install_required)
        }
        if (response.policy_ready) {
          setPolicyReady(response.policy_ready)
        }
      } catch (err) {
        // Remove temp message on error
        setMessages(prev => prev.filter(m => m.id !== tempUserMessage.id))
        setError(err instanceof Error ? err.message : 'Failed to send message')
      } finally {
        setIsLoading(false)
      }
    },
    [chatApi.sendMessage, walletContext]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!conversationId) {
        // Create conversation first
        try {
          const conversation = await chatApi.createConversation.mutateAsync()
          setConversationId(conversation.id)
          // Continue with the new conversation
          await sendMessageToConversation(conversation.id, content)
        } catch (err) {
          setError(
            err instanceof Error ? err.message : 'Failed to create conversation'
          )
        }
        return
      }

      await sendMessageToConversation(conversationId, content)
    },
    [conversationId, chatApi.createConversation, sendMessageToConversation]
  )

  const selectSuggestion = useCallback(
    async (suggestion: Suggestion) => {
      if (!conversationId) return

      setError(null)
      setIsLoading(true)
      setSuggestions([])

      try {
        const response = await chatApi.sendMessage.mutateAsync({
          conversationId,
          content: '',
          context: walletContext,
          selectedSuggestionId: suggestion.id,
        })

        setMessages(prev => [...prev, response.message])

        if (response.suggestions) {
          setSuggestions(response.suggestions)
        }
        if (response.install_required) {
          setInstallRequired(response.install_required)
        }
        if (response.policy_ready) {
          setPolicyReady(response.policy_ready)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to process suggestion'
        )
      } finally {
        setIsLoading(false)
      }
    },
    [conversationId, chatApi.sendMessage, walletContext]
  )

  const reportActionResult = useCallback(
    async (actionResult: ActionResult) => {
      if (!conversationId) return

      setError(null)
      setIsLoading(true)
      setInstallRequired(null)
      setPolicyReady(null)

      try {
        const response = await chatApi.sendMessage.mutateAsync({
          conversationId,
          content: '',
          context: walletContext,
          actionResult,
        })

        setMessages(prev => [...prev, response.message])

        if (response.suggestions) {
          setSuggestions(response.suggestions)
        }
        if (response.install_required) {
          setInstallRequired(response.install_required)
        }
        if (response.policy_ready) {
          setPolicyReady(response.policy_ready)
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to report action')
      } finally {
        setIsLoading(false)
      }
    },
    [conversationId, chatApi.sendMessage, walletContext]
  )

  const clearState = useCallback(() => {
    setSuggestions([])
    setInstallRequired(null)
    setPolicyReady(null)
    setError(null)
  }, [])

  const switchConversation = useCallback((id: string) => {
    setConversationId(id)
    setMessages([])
    setSuggestions([])
    setInstallRequired(null)
    setPolicyReady(null)
    setError(null)
  }, [])

  const deleteConversation = useCallback(
    async (id: string) => {
      try {
        await chatApi.deleteConversation.mutateAsync(id)
        if (conversationId === id) {
          setConversationId(null)
          setMessages([])
          setSuggestions([])
          setInstallRequired(null)
          setPolicyReady(null)
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to delete conversation'
        )
      }
    },
    [chatApi.deleteConversation, conversationId]
  )

  return useMemo(
    () => ({
      conversationId,
      messages,
      suggestions,
      installRequired,
      policyReady,
      isLoading,
      error,
      sendMessage,
      selectSuggestion,
      reportActionResult,
      startNewConversation,
      clearState,
      switchConversation,
      deleteConversation,
      conversations: chatApi.listConversations.data?.conversations ?? [],
      isConversationLoading: conversationQuery.isLoading,
    }),
    [
      conversationId,
      messages,
      suggestions,
      installRequired,
      policyReady,
      isLoading,
      error,
      sendMessage,
      selectSuggestion,
      reportActionResult,
      startNewConversation,
      clearState,
      switchConversation,
      deleteConversation,
      chatApi.listConversations.data?.conversations,
      conversationQuery.isLoading,
    ]
  )
}
