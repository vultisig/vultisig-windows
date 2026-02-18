import { ToolCallInfo } from '../types'

const getParam = (
  params: Record<string, unknown> | undefined,
  key: string
): string => {
  const val = params?.[key]
  if (typeof val === 'string') return val
  if (typeof val === 'number') return String(val)
  return ''
}

const formatters: Record<string, (params?: Record<string, unknown>) => string> =
  {
    add_chain: p => {
      const chain = getParam(p, 'chain')
      return chain ? `Add Chain: ${chain}` : 'Add Chain'
    },
    add_coin: p => {
      const ticker = getParam(p, 'ticker')
      const chain = getParam(p, 'chain')
      if (ticker && chain) return `Add Coin: ${ticker} (${chain})`
      if (ticker) return `Add Coin: ${ticker}`
      return 'Add Coin'
    },
    remove_coin: p => {
      const ticker = getParam(p, 'ticker')
      return ticker ? `Remove Coin: ${ticker}` : 'Remove Coin'
    },
    remove_chain: p => {
      const chain = getParam(p, 'chain')
      return chain ? `Remove Chain: ${chain}` : 'Remove Chain'
    },
    address_book_add: p => {
      const title = getParam(p, 'title')
      return title ? `Add Address: ${title}` : 'Add Address'
    },
    address_book_remove: p => {
      const id = getParam(p, 'id')
      return id ? `Remove Address: ${id}` : 'Remove Address'
    },
    get_address_book: () => 'Get Address Book',
    get_market_price: p => {
      const asset = getParam(p, 'asset')
      return asset ? `Get Price: ${asset}` : 'Get Price'
    },
    get_balances: () => 'Get Balances',
    get_portfolio: () => 'Get Portfolio',
    search_token: p => {
      const query = getParam(p, 'query')
      return query ? `Search Token: ${query}` : 'Search Token'
    },
    scan_tx: p => {
      const chain = getParam(p, 'chain')
      return chain ? `Scan Tx: ${chain}` : 'Scan Tx'
    },
    list_vaults: () => 'List Vaults',
  }

export const formatInlineToolCall = (toolCall: ToolCallInfo): string => {
  const formatter = formatters[toolCall.actionType]
  if (formatter) return formatter(toolCall.params)
  return toolCall.title
}
