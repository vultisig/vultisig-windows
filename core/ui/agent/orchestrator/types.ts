export type SendMessageRequest = {
  public_key: string
  content?: string
  context?: MessageContext
  selected_suggestion_id?: string
  action_result?: ActionResult
}

export type BalanceInfo = {
  chain: string
  asset: string
  symbol: string
  amount: string
  decimals: number
}

export type MessageContext = {
  vault_address?: string
  vault_name?: string
  balances?: BalanceInfo[]
  addresses?: Record<string, string>
  coins?: BackendCoinInfo[]
  address_book?: AddressBookEntry[]
}

export type BackendCoinInfo = {
  chain: string
  ticker: string
  contract_address?: string
  is_native_token: boolean
  decimals: number
}

export type AddressBookEntry = {
  title: string
  address: string
  chain: string
}

export type BackendAction = {
  id: string
  type: string
  title: string
  description?: string
  params?: Record<string, unknown>
  auto_execute: boolean
}

export type ActionResult = {
  action: string
  action_id?: string
  success: boolean
  data?: Record<string, unknown>
  error?: string
}

export type SendMessageResponse = {
  message: BackendMessage
  title?: string
  suggestions?: BackendSuggestion[]
  actions?: BackendAction[]
  policy_ready?: PolicyReady
  install_required?: InstallRequired
  tx_ready?: TxReady
}

export type TxReady = {
  provider?: string
  expected_output?: string
  minimum_output?: string
  needs_approval?: boolean
  keysign_payload?: string
  approval_tx?: TxData
  swap_tx?: TxData
  from_chain: string
  from_symbol: string
  to_chain?: string
  to_symbol?: string
  amount: string
  sender: string
  destination: string
  tx_type?: 'swap' | 'send'
  tx_details?: Record<string, unknown>
}

export type TxData = {
  to: string
  value: string
  data: string
  memo?: string
  nonce: number
  gas_limit: number
  chain_id?: string
  unsigned_tx?: string
  signing_hash?: string
  msg_hash?: string
}

export type TxBundle = {
  transactions: TxTransaction[]
  chain: string
  sender: string
  metadata?: Record<string, unknown>
}

export type TxTransaction = {
  type: string
  label: string
  tx_data: TxData
  metadata?: Record<string, unknown>
}

export type BackendMessage = {
  id: string
  conversation_id: string
  role: string
  content: string
  content_type: string
  created_at: string
}

export type BackendSuggestion = {
  id: string
  plugin_id: string
  title: string
  description: string
}

export type PolicyReady = {
  plugin_id: string
  configuration: Record<string, unknown>
  policy_suggest?: unknown
}

export type InstallRequired = {
  plugin_id: string
  title: string
  description: string
}

export type BackendConversation = {
  id: string
  public_key: string
  title?: string
  created_at: string
  updated_at: string
  archived_at?: string
}

export type BackendConversationWithMessages = BackendConversation & {
  messages: BackendMessage[]
}

export type ListConversationsResponse = {
  conversations: BackendConversation[]
  total_count: number
}

export type GetStartersRequest = {
  public_key: string
  context?: MessageContext
}

export type GetStartersResponse = {
  starters: string[]
}

export type ErrorResponse = {
  error: string
}

export type AuthToken = {
  token: string
  refreshToken: string
  expiresAt: number
}
