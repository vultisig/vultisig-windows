import { useCallback, useEffect, useState } from 'react'

import {
  Action,
  ActionResultEvent,
  AuthRequiredEvent,
  ChatMessage,
  CompleteEvent,
  ConfirmationRequiredEvent,
  ErrorEvent,
  InstallRequired,
  LoadingEvent,
  PasswordRequiredEvent,
  PolicyReady,
  ResponseEvent,
  Suggestion,
  ToolCallEvent,
  TxBundle,
  TxBundleEvent,
  TxStatusEvent,
  TxStatusInfo,
} from '../types'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    runtime: {
      EventsOn: (event: string, callback: (data: unknown) => void) => () => void
      EventsOff: (event: string) => void
      EventsEmit: (event: string, ...data: unknown[]) => void
    }
  }
}

type AgentEventsState = {
  messages: ChatMessage[]
  isLoading: boolean
  actions: Action[]
  suggestions: Suggestion[]
  policyReady: PolicyReady | null
  installRequired: InstallRequired | null
  txBundle: TxBundle | null
  passwordRequired: PasswordRequiredEvent | null
  confirmationRequired: ConfirmationRequiredEvent | null
  authRequired: AuthRequiredEvent | null
  error: string | null
  isComplete: boolean
}

type UseAgentEventsReturn = AgentEventsState & {
  addUserMessage: (content: string) => void
  setInitialMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void
  dismissPasswordRequired: () => void
  dismissConfirmation: () => void
  dismissAuthRequired: () => void
  dismissError: () => void
  dismissTxBundle: () => void
  dismissTxStatus: (txHash: string) => void
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
    normalized.includes('user canceled')
  ) {
    return 'agent stopped'
  }
  return error
}

export const useAgentEvents = (
  conversationId: string | null
): UseAgentEventsReturn => {
  const [state, setState] = useState<AgentEventsState>({
    messages: [],
    isLoading: false,
    actions: [],
    suggestions: [],
    policyReady: null,
    installRequired: null,
    txBundle: null,
    passwordRequired: null,
    confirmationRequired: null,
    authRequired: null,
    error: null,
    isComplete: false,
  })

  const appendAssistantMessage = useCallback((content: string) => {
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
  }, [])

  useEffect(() => {
    if (!window.runtime) return

    const cleanups: (() => void)[] = []

    const onLoading = (data: LoadingEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      setState(prev => ({
        ...prev,
        isLoading: true,
        isComplete: false,
        error: null,
      }))
    }

    const onResponse = (data: ResponseEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      const now = Date.now()
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

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, ...newMessages],
        isLoading: false,
        actions: data.actions || [],
        suggestions: data.suggestions || [],
        policyReady: data.policyReady || null,
        installRequired: data.installRequired || null,
      }))
    }

    const onTxBundle = (data: TxBundleEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      setState(prev => ({
        ...prev,
        txBundle: data.txBundle,
      }))
    }

    const onToolCall = (data: ToolCallEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

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
    }

    const onActionResult = (data: ActionResultEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

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

        return {
          ...prev,
          actions: prev.actions.filter(a => a.id !== data.actionId),
          txBundle: data.actionType === 'sign_tx' ? null : prev.txBundle,
          messages: updatedMessages,
        }
      })
    }

    const onPasswordRequired = (data: PasswordRequiredEvent) => {
      if (conversationId && data.conversationId !== conversationId) return
      setState(prev => ({
        ...prev,
        passwordRequired: data,
      }))
    }

    const onConfirmationRequired = (data: ConfirmationRequiredEvent) => {
      if (conversationId && data.conversationId !== conversationId) return
      setState(prev => ({
        ...prev,
        confirmationRequired: data,
      }))
    }

    const onAuthRequired = (data: AuthRequiredEvent) => {
      if (conversationId && data.conversationId !== conversationId) return
      setState(prev => ({
        ...prev,
        authRequired: data,
        isLoading: false,
      }))
    }

    const onComplete = (data: CompleteEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      setState(prev => ({
        ...prev,
        isLoading: false,
        isComplete: true,
      }))
    }

    const onError = (data: ErrorEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

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
    }

    const onTxStatus = (data: TxStatusEvent) => {
      if (conversationId && data.conversationId !== conversationId) return
      const msgId = `tx-status-${data.txHash}`
      setState(prev => {
        const existingIdx = prev.messages.findIndex(m => m.id === msgId)
        if (existingIdx >= 0) {
          const updated = prev.messages.map((m, i) =>
            i === existingIdx
              ? {
                  ...m,
                  txStatus: { ...m.txStatus!, status: data.status },
                }
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
    }

    cleanups.push(
      window.runtime.EventsOn(
        'agent:loading',
        onLoading as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:response',
        onResponse as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:tool_call',
        onToolCall as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:action_result',
        onActionResult as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:password_required',
        onPasswordRequired as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:confirmation_required',
        onConfirmationRequired as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:auth_required',
        onAuthRequired as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:tx_bundle',
        onTxBundle as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:complete',
        onComplete as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn('agent:error', onError as (data: unknown) => void)
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:tx_status',
        onTxStatus as (data: unknown) => void
      )
    )
    return () => {
      cleanups.forEach(cleanup => cleanup())
    }
  }, [conversationId, appendAssistantMessage])

  const addUserMessage = useCallback((content: string) => {
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
  }, [])

  const setInitialMessages = useCallback((messages: ChatMessage[]) => {
    setState(prev => ({
      ...prev,
      messages,
    }))
  }, [])

  const clearMessages = useCallback(() => {
    setState({
      messages: [],
      isLoading: false,
      actions: [],
      suggestions: [],
      policyReady: null,
      installRequired: null,
      txBundle: null,
      passwordRequired: null,
      confirmationRequired: null,
      authRequired: null,
      error: null,
      isComplete: false,
    })
  }, [])

  const dismissPasswordRequired = useCallback(() => {
    setState(prev => ({ ...prev, passwordRequired: null }))
  }, [])

  const dismissConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, confirmationRequired: null }))
  }, [])

  const dismissAuthRequired = useCallback(() => {
    setState(prev => ({ ...prev, authRequired: null }))
  }, [])

  const dismissError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const dismissTxBundle = useCallback(() => {
    setState(prev => ({ ...prev, txBundle: null }))
  }, [])

  const dismissTxStatus = useCallback((txHash: string) => {
    setState(prev => ({
      ...prev,
      messages: prev.messages.filter(m => m.id !== `tx-status-${txHash}`),
    }))
  }, [])

  const requestAuth = useCallback(() => {
    setState(prev => ({
      ...prev,
      authRequired: { conversationId: '', vaultPubKey: '' },
      isLoading: false,
    }))
  }, [])

  return {
    ...state,
    addUserMessage,
    setInitialMessages,
    clearMessages,
    dismissPasswordRequired,
    dismissConfirmation,
    dismissAuthRequired,
    dismissError,
    dismissTxBundle,
    dismissTxStatus,
    requestAuth,
  }
}
