export type ToolCall = {
  id: string
  name: string
  input: Record<string, unknown>
  status: 'running' | 'complete' | 'error'
  output?: unknown
  error?: string
  progress?: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  toolCalls?: ToolCall[]
  timestamp: string
}

export type Conversation = {
  id: string
  name: string
  vaultPubKey: string
  policyId?: string
  status: 'active' | 'completed' | 'failed'
  messages: ChatMessage[]
  createdAt: string
  updatedAt: string
}

export type TextDeltaEvent = {
  conversationId: string
  delta: string
}

export type ToolCallEvent = {
  conversationId: string
  id: string
  name: string
  input: Record<string, unknown>
}

export type ToolResultEvent = {
  conversationId: string
  id: string
  output: unknown
  error?: string
}

export type PasswordRequiredEvent = {
  conversationId: string
  toolName: string
  operation: string
}

export type ConfirmationRequiredEvent = {
  conversationId: string
  action: string
  details: string
  toolCallId: string
}

export type ToolProgressEvent = {
  conversationId: string
  toolCallId: string
  step: string
}

export type CompleteEvent = {
  conversationId: string
  message: string
}

export type ErrorEvent = {
  conversationId: string
  error: string
}

export type AgentEvent =
  | { type: 'thinking'; data: { conversationId: string } }
  | { type: 'text_delta'; data: TextDeltaEvent }
  | { type: 'tool_call'; data: ToolCallEvent }
  | { type: 'tool_result'; data: ToolResultEvent }
  | { type: 'password_required'; data: PasswordRequiredEvent }
  | { type: 'confirmation_required'; data: ConfirmationRequiredEvent }
  | { type: 'complete'; data: CompleteEvent }
  | { type: 'error'; data: ErrorEvent }
