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

type Formatter = (toolCall: ToolCallInfo) => string

const formatters: Record<string, Formatter> = {
  add_chain: tc => {
    const chain = getParam(tc.params, 'chain')
    return chain ? `Add Chain: ${chain}` : 'Add Chain'
  },
  add_coin: tc => {
    const ticker = getParam(tc.params, 'ticker')
    const chain = getParam(tc.params, 'chain')
    if (ticker && chain) return `Add Coin: ${ticker} (${chain})`
    if (ticker) return `Add Coin: ${ticker}`
    return 'Add Coin'
  },
  remove_coin: tc => {
    const ticker = getParam(tc.params, 'ticker')
    return ticker ? `Remove Coin: ${ticker}` : 'Remove Coin'
  },
  remove_chain: tc => {
    const chain = getParam(tc.params, 'chain')
    return chain ? `Remove Chain: ${chain}` : 'Remove Chain'
  },
  address_book_add: tc => {
    const title = getParam(tc.params, 'title')
    return title ? `Add Address: ${title}` : 'Add Address'
  },
  address_book_remove: tc => {
    const id = getParam(tc.params, 'id')
    return id ? `Remove Address: ${id}` : 'Remove Address'
  },
  get_address_book: () => 'Get Address Book',
  get_market_price: tc => {
    const asset = getParam(tc.params, 'asset')
    return asset ? `Get Price: ${asset}` : 'Get Price'
  },
  get_balances: () => 'Get Balances',
  get_portfolio: () => 'Get Portfolio',
  search_token: tc => {
    const query = getParam(tc.params, 'query')
    const base = query ? `Search Token: ${query}` : 'Search Token'

    if (tc.status !== 'success' || !tc.resultData) return base

    const results = tc.resultData.results
    if (!Array.isArray(results) || results.length === 0) return base

    const top = results[0] as Record<string, unknown>
    const name = getParam(top, 'name')
    const chain = getParam(top, 'chain')
    const price = getParam(top, 'price_usd')

    const parts = [base]
    if (name || chain) {
      const detail = [name, chain ? `(${chain})` : ''].filter(Boolean).join(' ')
      parts.push(detail)
    }
    if (price) {
      parts.push(`$${price}`)
    }

    return parts.join(' — ')
  },
  scan_tx: tc => {
    const chain = getParam(tc.params, 'chain')
    const base = chain ? `Security Scan: ${chain}` : 'Security Scan'

    if (tc.status !== 'success' || !tc.resultData) return base

    const resultType = getParam(tc.resultData, 'result_type')
    if (resultType === 'benign') return `${base} — Safe`
    if (resultType === 'warning') return `${base} — Warning`
    if (resultType === 'malicious') return `${base} — Malicious`
    if (resultType === 'unsupported') return `${base} — Not Available`

    return base
  },
  list_vaults: () => 'List Vaults',
}

export const formatInlineToolCall = (toolCall: ToolCallInfo): string => {
  const formatter = formatters[toolCall.actionType]
  if (formatter) return formatter(toolCall)
  return toolCall.title
}
