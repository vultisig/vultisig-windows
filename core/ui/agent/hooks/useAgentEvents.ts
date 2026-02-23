import { useEffect, useRef, useState } from 'react'

import type { AgentOrchestrator } from '../orchestrator'
import type {
  ActionResultEvent,
  AuthRequiredEvent,
  ChatMessage,
  CompleteEvent,
  ConfirmationRequiredEvent,
  ErrorEvent,
  LoadingEvent,
  PasswordRequiredEvent,
  ResponseEvent,
  TextDeltaEvent,
  ToolCallEvent,
  TxStatusEvent,
  TxStatusInfo,
} from '../types'

type AgentEventsState = {
  messages: ChatMessage[]
  isLoading: boolean
  passwordRequired: PasswordRequiredEvent | null
  confirmationRequired: ConfirmationRequiredEvent | null
  authRequired: AuthRequiredEvent | null
  error: string | null
  isComplete: boolean
}

type UseAgentEventsReturn = AgentEventsState & {
  addUserMessage: (content: string) => void
  setInitialMessages: (messages: ChatMessage[]) => void
  dismissPasswordRequired: () => void
  dismissConfirmation: () => void
  dismissAuthRequired: () => void
  dismissError: () => void
  requestAuth: () => void
}

const agentStoppedMessage =
  "Agent stopped. Send a new message when you're ready."

const normalizeAgentErrorMessage = (error: string) => {
  const normalized = error.toLowerCase()
  if (
    normalized.includes('context canceled') ||
    normalized.includes('context cancelled') ||
    normalized.includes('user cancelled') ||
    normalized.includes('user canceled') ||
    normalized.includes('agent stopped')
  ) {
    return 'agent stopped'
  }
  return error
}

export const useAgentEvents = (
  conversationId: string | null,
  orchestrator?: AgentOrchestrator
): UseAgentEventsReturn => {
  const [state, setState] = useState<AgentEventsState>({
    messages: [],
    isLoading: false,
    passwordRequired: null,
    confirmationRequired: null,
    authRequired: null,
    error: null,
    isComplete: false,
  })

  const convIdRef = useRef(conversationId)
  convIdRef.current = conversationId

  const streamingMsgIdRef = useRef<string | null>(null)

  const appendAssistantMessage = (content: string) => {
    if (!content.trim()) return
    const now = Date.now()
    const assistantMessage: ChatMessage = {
      id: `msg-${now}`,
      role: 'assistant',
      content,
      timestamp: new Date(now).toISOString(),
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, assistantMessage],
    }))
  }

  useEffect(() => {
    if (!orchestrator) return

    const cleanups: (() => void)[] = []

    cleanups.push(
      orchestrator.events.on('loading', (data: LoadingEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return
        streamingMsgIdRef.current = null
        setState(prev => ({
          ...prev,
          isLoading: true,
          isComplete: false,
          error: null,
        }))
      })
    )

    cleanups.push(
      orchestrator.events.on('text_delta', (data: TextDeltaEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return
        setState(prev => {
          const existingId = streamingMsgIdRef.current
          if (existingId) {
            return {
              ...prev,
              messages: prev.messages.map(m =>
                m.id === existingId
                  ? { ...m, content: m.content + data.delta }
                  : m
              ),
            }
          }

          const msgId = `streaming-${Date.now()}`
          streamingMsgIdRef.current = msgId
          const streamMsg: ChatMessage = {
            id: msgId,
            role: 'assistant',
            content: data.delta,
            timestamp: new Date().toISOString(),
          }
          return {
            ...prev,
            messages: [...prev.messages, streamMsg],
            isLoading: false,
          }
        })
      })
    )

    cleanups.push(
      orchestrator.events.on('response', (data: ResponseEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return

        const streamingId = streamingMsgIdRef.current
        streamingMsgIdRef.current = null
        const now = Date.now()

        setState(prev => {
          if (streamingId && data.message?.trim()) {
            return {
              ...prev,
              messages: prev.messages.map(m =>
                m.id === streamingId
                  ? {
                      ...m,
                      id: `msg-${now}`,
                      content: data.message,
                      actions: data.actions,
                    }
                  : m
              ),
              isLoading: false,
            }
          }

          const newMessages: ChatMessage[] = []
          if (data.message?.trim()) {
            newMessages.push({
              id: `msg-${now}`,
              role: 'assistant',
              content: data.message,
              actions: data.actions,
              timestamp: new Date(now).toISOString(),
            })
          }
          return {
            ...prev,
            messages: [...prev.messages, ...newMessages],
            isLoading: false,
          }
        })
      })
    )

    cleanups.push(
      orchestrator.events.on('tool_call', (data: ToolCallEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return
        const toolCallMessage: ChatMessage = {
          id: `tool-call-${data.actionId}`,
          role: 'assistant',
          content: '',
          timestamp: new Date().toISOString(),
          toolCall: {
            actionType: data.actionType,
            title: data.title || data.actionType.replace(/_/g, ' '),
            params: data.params,
            status: 'running',
          },
        }
        setState(prev => ({
          ...prev,
          messages: [...prev.messages, toolCallMessage],
        }))
      })
    )

    cleanups.push(
      orchestrator.events.on('action_result', (data: ActionResultEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return
        const toolCallId = `tool-call-${data.actionId}`
        const status: 'success' | 'error' = data.success ? 'success' : 'error'

        setState(prev => {
          const hasToolCall = prev.messages.some(m => m.id === toolCallId)
          const updatedMessages = hasToolCall
            ? prev.messages.map(m =>
                m.id === toolCallId
                  ? {
                      ...m,
                      toolCall: {
                        ...m.toolCall!,
                        status,
                        resultData: data.data,
                        error: data.error,
                      },
                    }
                  : m
              )
            : [
                ...prev.messages,
                {
                  id: toolCallId,
                  role: 'assistant' as const,
                  content: '',
                  timestamp: new Date().toISOString(),
                  toolCall: {
                    actionType: data.actionType,
                    title: data.actionType.replace(/_/g, ' '),
                    status,
                    resultData: data.data,
                    error: data.error,
                  },
                },
              ]
          return { ...prev, messages: updatedMessages }
        })
      })
    )

    cleanups.push(
      orchestrator.events.on(
        'password_required',
        (data: PasswordRequiredEvent) => {
          if (convIdRef.current && data.conversationId !== convIdRef.current)
            return
          setState(prev => ({ ...prev, passwordRequired: data }))
        }
      )
    )

    cleanups.push(
      orchestrator.events.on(
        'confirmation_required',
        (data: ConfirmationRequiredEvent) => {
          if (convIdRef.current && data.conversationId !== convIdRef.current)
            return
          setState(prev => ({ ...prev, confirmationRequired: data }))
        }
      )
    )

    cleanups.push(
      orchestrator.events.on('auth_required', (data: AuthRequiredEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return
        setState(prev => ({
          ...prev,
          authRequired: data,
          isLoading: false,
        }))
      })
    )

    cleanups.push(
      orchestrator.events.on('complete', (data: CompleteEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return
        setState(prev => ({
          ...prev,
          isLoading: false,
          isComplete: true,
        }))
      })
    )

    cleanups.push(
      orchestrator.events.on('error', (data: ErrorEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return
        streamingMsgIdRef.current = null
        const normalizedError = normalizeAgentErrorMessage(data.error)
        const isStopped = normalizedError === 'agent stopped'
        if (isStopped) {
          appendAssistantMessage(agentStoppedMessage)
        }
        setState(prev => ({
          ...prev,
          error: isStopped ? null : normalizedError,
          isLoading: false,
          passwordRequired: null,
          confirmationRequired: null,
        }))
      })
    )

    cleanups.push(
      orchestrator.events.on('title_updated', () => {
        // title updates are handled in AgentChatPage directly
      })
    )

    cleanups.push(
      orchestrator.events.on('tx_status', (data: TxStatusEvent) => {
        if (convIdRef.current && data.conversationId !== convIdRef.current)
          return
        const msgId = `tx-status-${data.txHash}`
        setState(prev => {
          const existingIdx = prev.messages.findIndex(m => m.id === msgId)
          if (existingIdx >= 0) {
            const updated = prev.messages.map((m, i) =>
              i === existingIdx
                ? { ...m, txStatus: { ...m.txStatus!, status: data.status } }
                : m
            )
            return { ...prev, messages: updated }
          }
          const entry: TxStatusInfo = {
            txHash: data.txHash,
            chain: data.chain,
            status: data.status,
            label: data.label,
          }
          const txMsg: ChatMessage = {
            id: msgId,
            role: 'assistant',
            content: '',
            timestamp: new Date().toISOString(),
            txStatus: entry,
          }
          return { ...prev, messages: [...prev.messages, txMsg] }
        })
      })
    )

    return () => {
      cleanups.forEach(cleanup => cleanup())
    }
  }, [orchestrator])

  const addUserMessage = (content: string) => {
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    }
    setState(prev => ({
      ...prev,
      messages: [...prev.messages, message],
      isComplete: false,
    }))
  }

  const setInitialMessages = (messages: ChatMessage[]) => {
    setState(prev => ({ ...prev, messages }))
  }

  const dismissPasswordRequired = () => {
    setState(prev => ({ ...prev, passwordRequired: null }))
  }

  const dismissConfirmation = () => {
    setState(prev => ({ ...prev, confirmationRequired: null }))
  }

  const dismissAuthRequired = () => {
    setState(prev => ({ ...prev, authRequired: null }))
  }

  const dismissError = () => {
    setState(prev => ({ ...prev, error: null }))
  }

  const requestAuth = () => {
    setState(prev => ({
      ...prev,
      authRequired: { conversationId: '', vaultPubKey: '' },
      isLoading: false,
    }))
  }

  return {
    ...state,
    addUserMessage,
    setInitialMessages,
    dismissPasswordRequired,
    dismissConfirmation,
    dismissAuthRequired,
    dismissError,
    requestAuth,
  }
}
