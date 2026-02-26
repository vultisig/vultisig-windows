export type Action = {
  id: string
  type: string
  title: string
  description?: string
  params?: Record<string, unknown>
}

export type Suggestion = {
  id: string
  plugin_id: string
  title: string
  description: string
}

export type ToolCallStatus = 'running' | 'success' | 'error'

export type ToolCallInfo = {
  actionType: string
  title: string
  params?: Record<string, unknown>
  status: ToolCallStatus
  resultData?: Record<string, unknown>
  error?: string
}

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  actions?: Action[]
  timestamp: string
  toolCall?: ToolCallInfo
  txStatus?: TxStatusInfo
}

export type Conversation = {
  id: string
  public_key: string
  title?: string
  created_at: string
  updated_at: string
}

export type ConversationWithMessages = Conversation & {
  messages: Array<{
    id: string
    conversation_id: string
    role: string
    content: string
    content_type: string
    created_at: string
  }>
}

export type LoadingEvent = {
  conversationId: string
}

export type ResponseEvent = {
  conversationId: string
  message: string
  actions?: Action[]
  suggestions?: Suggestion[]
}

export type ActionResultEvent = {
  conversationId: string
  actionId: string
  actionType: string
  success: boolean
  data?: Record<string, unknown>
  error?: string
}

export type PasswordRequiredEvent = {
  conversationId: string
  toolName: string
  operation: string
  requestId: string
}

export type ConfirmationRequiredEvent = {
  conversationId: string
  action: string
  details: string
  actionId: string
  requestId: string
}

export type CompleteEvent = {
  conversationId: string
  message: string
}

export type ErrorEvent = {
  conversationId: string
  error: string
}

export type AuthRequiredEvent = {
  conversationId: string
  vaultPubKey: string
}

export type TitleUpdatedEvent = {
  conversationId: string
  title: string
}

export type TextDeltaEvent = {
  conversationId: string
  delta: string
}

export type ServiceStatus = {
  authenticated: boolean
}

export type ToolCallEvent = {
  conversationId: string
  actionId: string
  actionType: string
  title: string
  params?: Record<string, unknown>
}

export type TxStatusInfo = {
  txHash: string
  chain: string
  status: 'pending' | 'confirmed' | 'failed'
  label: string
}

export type TxStatusEvent = {
  conversationId: string
  txHash: string
  chain: string
  status: 'pending' | 'confirmed' | 'failed'
  label: string
}
