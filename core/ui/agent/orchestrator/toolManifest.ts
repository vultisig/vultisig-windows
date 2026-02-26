import type { AppToolDeclaration } from './types'

export const toolManifest: AppToolDeclaration[] = [
  { name: 'get_market_price', params: 'asset, fiat (default "usd")' },
  { name: 'get_balances', params: 'chain (optional)' },
  { name: 'get_portfolio', params: 'fiat (default "usd")' },
  { name: 'add_chain', params: 'chain' },
  { name: 'add_coin', params: 'chain, ticker, contract_address (optional)' },

  { name: 'remove_coin', params: 'chain, ticker' },
  { name: 'remove_chain', params: 'chain' },
  {
    name: 'build_swap_tx',
    params:
      'from_chain, from_symbol, from_contract, from_decimals, to_chain, to_symbol, to_contract, to_decimals, amount',
  },
  {
    name: 'build_send_tx',
    params: 'chain, symbol, address, amount, memo (optional)',
  },
  {
    name: 'build_custom_tx',
    params:
      'tx_type, chain, symbol, amount, memo, contract_address, function_name, params, value, execute_msg, funds',
  },
  {
    name: 'sign_tx',
    params: '(no params needed — app fills from stored tx)',
  },
  { name: 'list_vaults', params: '' },
  { name: 'plugin_install', params: 'plugin_id' },
  { name: 'create_policy', params: 'plugin_id, configuration' },
  { name: 'delete_policy', params: 'policy_id' },
  { name: 'address_book_add', params: 'name, chain, address' },
  { name: 'address_book_remove', params: 'name, chain' },
  {
    name: 'read_evm_contract',
    params: 'chain, contract_address, function_name, params, output_types',
  },
  { name: 'search_token', params: 'query, chain (optional)' },
  { name: 'scan_tx', params: 'chain, from, to, value, data' },
  { name: 'thorchain_query', params: 'query_type, asset (optional)' },
]
