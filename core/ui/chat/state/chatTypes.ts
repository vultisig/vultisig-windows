// Types for chat module, matching agent-backend API

export type MessageRole = 'user' | 'assistant' | 'system'

export type Message = {
  id: string
  conversation_id: string
  role: MessageRole
  content: string
  content_type: string
  audio_url?: string
  metadata?: Record<string, unknown>
  created_at: string
}

export type Conversation = {
  id: string
  public_key: string
  title?: string
  created_at: string
  updated_at: string
  archived_at?: string
}

export type ConversationWithMessages = Conversation & {
  messages: Message[]
}

export type Balance = {
  chain: string
  asset: string
  symbol: string
  amount: string
  decimals: number
}

export type MessageContext = {
  vault_address?: string
  balances?: Balance[]
  addresses?: Record<string, string>
}

export type ActionResult = {
  action: string
  success: boolean
  error?: string
}

export type Suggestion = {
  id: string
  plugin_id: string
  title: string
  description: string
}

export type InstallRequired = {
  plugin_id: string
  title: string
  description: string
}

export type PolicySuggestData = {
  rateLimitWindow?: number
  maxTxsPerWindow?: number
  rules: unknown[]
}

export type PolicyReady = {
  plugin_id: string
  configuration: Record<string, unknown>
  policy_suggest: PolicySuggestData
}

export type AuthResponse = {
  access_token: string
  refresh_token: string
  expires_in: number
}

export type SendMessageRequest = {
  public_key: string
  content: string
  context?: MessageContext
  selected_suggestion_id?: string
  action_result?: ActionResult
}

export type SendMessageResponse = {
  message: Message
  suggestions?: Suggestion[]
  policy_ready?: PolicyReady
  install_required?: InstallRequired
}

export type ListConversationsResponse = {
  conversations: Conversation[]
  total_count: number
}
