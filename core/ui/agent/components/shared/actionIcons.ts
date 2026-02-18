const actionIcons: Record<string, string> = {
  get_market_price: '\u{1F4C8}',
  get_balances: '\u{1F4B0}',
  get_portfolio: '\u{1F4CA}',
  add_chain: '\u{1F517}',
  add_coin: '\u{1FA99}',
  remove_coin: '\u{274C}',
  remove_chain: '\u{274C}',
  initiate_send: '\u{1F4E4}',
  initiate_swap: '\u{1F504}',
  rename_vault: '\u{270F}\u{FE0F}',
  plugin_install: '\u{1F50C}',
  create_policy: '\u{1F4DD}',
  delete_policy: '\u{1F5D1}\u{FE0F}',
  address_book_add: '\u{1F4D6}',
  address_book_remove: '\u{1F4D6}',
}

export const getActionIcon = (actionType: string): string =>
  actionIcons[actionType] || '\u{26A1}'
