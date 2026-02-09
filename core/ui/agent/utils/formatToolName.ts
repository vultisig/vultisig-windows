const toolDisplayNames: Record<string, string> = {
  plugin_install: 'Install Plugin',
  plugin_uninstall: 'Uninstall Plugin',
  plugin_list: 'List Plugins',
  plugin_installed: 'Check Plugin Status',
  policy_add: 'Add Policy',
  policy_delete: 'Delete Policy',
  policy_list: 'List Policies',
  policy_status: 'Policy Status',
  transaction_history: 'Transaction History',
  policy_generate: 'Generate Policy',
  initiate_swap: 'Initiate Swap',
  initiate_send: 'Initiate Send',
  get_balances: 'Get Balances',
  get_coins: 'Get Coins',
  get_chains: 'Get Chains',
  get_chain_address: 'Get Chain Address',
  add_coin: 'Add Coin',
  remove_coin: 'Remove Coin',
  get_address_book: 'Get Address Book',
  add_address_book_entry: 'Add Address Book Entry',
  remove_address_book_entry: 'Remove Address Book Entry',
  list_vaults: 'List Vaults',
  rename_vault: 'Rename Vault',
  vault_info: 'Vault Info',
}

export const formatToolName = (toolName: string): string => {
  if (toolDisplayNames[toolName]) {
    return toolDisplayNames[toolName]
  }

  return toolName
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}
