import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const swapTerms = ['input', 'output'] as const

export const { useState: useSwapTerms, provider: SwapTermsProvider } =
  getStateProviderSetup<boolean[]>('SwapTerms')
