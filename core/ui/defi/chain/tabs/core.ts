/**
 * The segments the DeFi chain detail page can show. Kept apart from the tab
 * configuration so navigation state can name a tab without pulling the tab
 * content components in with it.
 */
export type DefiChainPageTab =
  | 'bonded'
  | 'staked'
  | 'earn'
  | 'lps'
  | 'governance'
