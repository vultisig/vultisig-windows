const defiChainPageTabs = [
  'bonded',
  'staked',
  'earn',
  'lps',
  'governance',
] as const

/**
 * A segment of the DeFi chain detail page. Kept apart from the tab
 * configuration so navigation state can name a tab without pulling the tab
 * content components in with it.
 */
export type DefiChainPageTab = (typeof defiChainPageTabs)[number]

/**
 * Narrows a tab name that arrives as a plain string - persisted navigation
 * state, an older build's view state - to one the page still has a segment
 * for.
 */
export const isDefiChainPageTab = (value: string): value is DefiChainPageTab =>
  defiChainPageTabs.some(tab => tab === value)
