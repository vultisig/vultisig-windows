import { useCallback, useEffect, useRef, useState } from 'react'

import {
  ChatMessage,
  CompleteEvent,
  ConfirmationRequiredEvent,
  ErrorEvent,
  PasswordRequiredEvent,
  TextDeltaEvent,
  ToolCall,
  ToolCallEvent,
  ToolProgressEvent,
  ToolResultEvent,
} from '../types'

declare global {
  // eslint-disable-next-line @typescript-eslint/consistent-type-definitions
  interface Window {
    runtime: {
      EventsOn: (event: string, callback: (data: unknown) => void) => () => void
      EventsOff: (event: string) => void
    }
  }
}

export type StreamingSegment =
  | { type: 'text'; content: string }
  | { type: 'toolCalls'; calls: ToolCall[] }

type AgentEventsState = {
  messages: ChatMessage[]
  isThinking: boolean
  streamingSegments: StreamingSegment[]
  toolResults: ToolCall[]
  passwordRequired: PasswordRequiredEvent | null
  confirmationRequired: ConfirmationRequiredEvent | null
  error: string | null
  isComplete: boolean
}

type UseAgentEventsReturn = AgentEventsState & {
  addUserMessage: (content: string) => void
  setInitialMessages: (messages: ChatMessage[]) => void
  clearMessages: () => void
  dismissPasswordRequired: () => void
  dismissConfirmation: () => void
  dismissError: () => void
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
    isThinking: false,
    streamingSegments: [],
    toolResults: [],
    passwordRequired: null,
    confirmationRequired: null,
    error: null,
    isComplete: false,
  })

  const streamingSegmentsRef = useRef<StreamingSegment[]>([])
  const toolResultsRef = useRef<ToolCall[]>([])
  const toolCallsMapRef = useRef<Map<string, ToolCall>>(new Map())

  const appendAssistantMessagesFromSegments = useCallback(
    (segments: StreamingSegment[]) => {
      const now = Date.now()
      let offset = 0

      const assistantMessages: ChatMessage[] = segments.flatMap(segment => {
        if (segment.type === 'text') {
          const content = segment.content.trim()
          if (!content) return []
          return [
            {
              id: `msg-${now}-${offset++}`,
              role: 'assistant',
              content,
              timestamp: new Date(now + offset).toISOString(),
            },
          ]
        }

        if (segment.calls.length === 0) return []

        return [
          {
            id: `msg-${now}-${offset++}`,
            role: 'assistant',
            content: '',
            toolCalls: segment.calls,
            timestamp: new Date(now + offset).toISOString(),
          },
        ]
      })

      if (assistantMessages.length === 0) return

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, ...assistantMessages],
      }))
    },
    []
  )

  const appendAssistantMessage = useCallback((content: string) => {
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

    const onThinking = () => {
      setState(prev => ({
        ...prev,
        isThinking: true,
        isComplete: false,
        error: null,
      }))
    }

    const onTextDelta = (data: TextDeltaEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      const segments = streamingSegmentsRef.current
      const lastSegment = segments[segments.length - 1]

      if (lastSegment && lastSegment.type === 'text') {
        lastSegment.content += data.delta
      } else {
        segments.push({ type: 'text', content: data.delta })
      }

      streamingSegmentsRef.current = [...segments]
      setState(prev => ({
        ...prev,
        streamingSegments: [...streamingSegmentsRef.current],
        isThinking: false,
      }))
    }

    const onToolCall = (data: ToolCallEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      const tc: ToolCall = {
        id: data.id,
        name: data.name,
        input: data.input,
        status: 'running',
      }
      toolCallsMapRef.current.set(data.id, tc)

      const segments = streamingSegmentsRef.current
      const lastSegment = segments[segments.length - 1]

      if (lastSegment && lastSegment.type === 'toolCalls') {
        lastSegment.calls.push(tc)
      } else {
        segments.push({ type: 'toolCalls', calls: [tc] })
      }

      streamingSegmentsRef.current = [...segments]
      setState(prev => ({
        ...prev,
        streamingSegments: [...streamingSegmentsRef.current],
        isThinking: false,
      }))
    }

    const onToolResult = (data: ToolResultEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      const tc = toolCallsMapRef.current.get(data.id)
      if (tc) {
        tc.status = data.error ? 'error' : 'complete'
        tc.output = data.output
        tc.error = data.error
        toolCallsMapRef.current.set(data.id, tc)

        toolResultsRef.current = Array.from(
          toolCallsMapRef.current.values()
        ).filter(t => t.status === 'complete' || t.status === 'error')

        const updatedSegments = streamingSegmentsRef.current.map(segment => {
          if (segment.type === 'toolCalls') {
            return {
              ...segment,
              calls: segment.calls.map(call =>
                call.id === data.id ? tc : call
              ),
            }
          }
          return segment
        })
        streamingSegmentsRef.current = updatedSegments

        setState(prev => ({
          ...prev,
          streamingSegments: [...streamingSegmentsRef.current],
          toolResults: [...toolResultsRef.current],
        }))
      }
    }

    const onToolProgress = (data: ToolProgressEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      const tc = toolCallsMapRef.current.get(data.toolCallId)
      if (tc) {
        tc.progress = data.step
        toolCallsMapRef.current.set(data.toolCallId, tc)

        const updatedSegments = streamingSegmentsRef.current.map(segment => {
          if (segment.type === 'toolCalls') {
            return {
              ...segment,
              calls: segment.calls.map(call =>
                call.id === data.toolCallId
                  ? { ...call, progress: data.step }
                  : call
              ),
            }
          }
          return segment
        })
        streamingSegmentsRef.current = updatedSegments

        setState(prev => ({
          ...prev,
          streamingSegments: [...streamingSegmentsRef.current],
        }))
      }
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

    const onComplete = (data: CompleteEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      appendAssistantMessagesFromSegments(streamingSegmentsRef.current)

      setState(prev => ({
        ...prev,
        streamingSegments: [],
        toolResults: [],
        isThinking: false,
        isComplete: true,
      }))

      streamingSegmentsRef.current = []
      toolResultsRef.current = []
      toolCallsMapRef.current.clear()
    }

    const onError = (data: ErrorEvent) => {
      if (conversationId && data.conversationId !== conversationId) return

      appendAssistantMessagesFromSegments(streamingSegmentsRef.current)
      streamingSegmentsRef.current = []
      toolResultsRef.current = []
      toolCallsMapRef.current.clear()

      const normalizedError = normalizeAgentErrorMessage(data.error)
      const isStopped = normalizedError === 'agent stopped'

      if (isStopped) {
        appendAssistantMessage(agentStoppedMessage)
      }

      setState(prev => ({
        ...prev,
        error: isStopped ? null : normalizedError,
        isThinking: false,
        streamingSegments: [],
        toolResults: [],
        passwordRequired: null,
        confirmationRequired: null,
      }))
    }

    cleanups.push(window.runtime.EventsOn('agent:thinking', onThinking))
    cleanups.push(
      window.runtime.EventsOn(
        'agent:text_delta',
        onTextDelta as (data: unknown) => void
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
        'agent:tool_result',
        onToolResult as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn(
        'agent:tool_progress',
        onToolProgress as (data: unknown) => void
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
        'agent:complete',
        onComplete as (data: unknown) => void
      )
    )
    cleanups.push(
      window.runtime.EventsOn('agent:error', onError as (data: unknown) => void)
    )
    return () => {
      cleanups.forEach(cleanup => cleanup())
    }
  }, [
    conversationId,
    appendAssistantMessagesFromSegments,
    appendAssistantMessage,
  ])

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
      isThinking: false,
      streamingSegments: [],
      toolResults: [],
      passwordRequired: null,
      confirmationRequired: null,
      error: null,
      isComplete: false,
    })
    streamingSegmentsRef.current = []
    toolResultsRef.current = []
    toolCallsMapRef.current.clear()
  }, [])

  const dismissPasswordRequired = useCallback(() => {
    setState(prev => ({ ...prev, passwordRequired: null }))
  }, [])

  const dismissConfirmation = useCallback(() => {
    setState(prev => ({ ...prev, confirmationRequired: null }))
  }, [])

  const dismissError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  return {
    ...state,
    addUserMessage,
    setInitialMessages,
    clearMessages,
    dismissPasswordRequired,
    dismissConfirmation,
    dismissError,
  }
}
