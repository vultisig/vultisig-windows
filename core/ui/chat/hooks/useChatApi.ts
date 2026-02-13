import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { agentBackendUrl } from '../state/chatConfig'
import {
  ActionResult,
  Conversation,
  ConversationWithMessages,
  ListConversationsResponse,
  MessageContext,
  SendMessageRequest,
  SendMessageResponse,
} from '../state/chatTypes'

type ChatApiOptions = {
  publicKey: string
  accessToken: string
}

const createHeaders = (accessToken: string) => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${accessToken}`,
})

export const useChatApi = ({ publicKey, accessToken }: ChatApiOptions) => {
  const queryClient = useQueryClient()

  // Create a new conversation
  const createConversation = useMutation({
    mutationFn: async (): Promise<Conversation> => {
      const response = await fetch(`${agentBackendUrl}/agent/conversations`, {
        method: 'POST',
        headers: createHeaders(accessToken),
        body: JSON.stringify({ public_key: publicKey }),
      })
      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', publicKey] })
    },
  })

  // List conversations
  const listConversations = useQuery({
    queryKey: ['conversations', publicKey],
    queryFn: async (): Promise<ListConversationsResponse> => {
      const response = await fetch(
        `${agentBackendUrl}/agent/conversations/list`,
        {
          method: 'POST',
          headers: createHeaders(accessToken),
          body: JSON.stringify({ public_key: publicKey, skip: 0, take: 20 }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to list conversations')
      }
      return response.json()
    },
    enabled: !!publicKey && !!accessToken,
  })

  // Send message
  const sendMessage = useMutation({
    mutationFn: async ({
      conversationId,
      content,
      context,
      selectedSuggestionId,
      actionResult,
    }: {
      conversationId: string
      content: string
      context?: MessageContext
      selectedSuggestionId?: string
      actionResult?: ActionResult
    }): Promise<SendMessageResponse> => {
      const body: SendMessageRequest = {
        public_key: publicKey,
        content,
        context,
        selected_suggestion_id: selectedSuggestionId,
        action_result: actionResult,
      }

      const response = await fetch(
        `${agentBackendUrl}/agent/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          headers: createHeaders(accessToken),
          body: JSON.stringify(body),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to send message')
      }
      return response.json()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['conversation', variables.conversationId],
      })
    },
  })

  // Delete/archive conversation
  const deleteConversation = useMutation({
    mutationFn: async (conversationId: string): Promise<void> => {
      const response = await fetch(
        `${agentBackendUrl}/agent/conversations/${conversationId}`,
        {
          method: 'DELETE',
          headers: createHeaders(accessToken),
          body: JSON.stringify({ public_key: publicKey }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to delete conversation')
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations', publicKey] })
    },
  })

  return {
    createConversation,
    listConversations,
    sendMessage,
    deleteConversation,
  }
}

// Separate hook for getting conversation with messages
export const useGetConversation = (
  conversationId: string | null,
  publicKey: string,
  accessToken: string
) => {
  return useQuery({
    queryKey: ['conversation', conversationId],
    queryFn: async (): Promise<ConversationWithMessages> => {
      if (!conversationId) throw new Error('No conversation ID')
      const response = await fetch(
        `${agentBackendUrl}/agent/conversations/${conversationId}`,
        {
          method: 'POST',
          headers: createHeaders(accessToken),
          body: JSON.stringify({ public_key: publicKey }),
        }
      )
      if (!response.ok) {
        throw new Error('Failed to get conversation')
      }
      return response.json()
    },
    enabled: !!conversationId && !!publicKey && !!accessToken,
  })
}
