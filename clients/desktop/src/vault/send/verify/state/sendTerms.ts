import { getStateProviderSetup } from '@lib/ui/state/getStateProviderSetup'

export const sendTerms = [
  'send_terms_0',
  'send_terms_1',
  'send_terms_2',
] as const

export const { useState: useSendTerms, provider: SendTermsProvider } =
  getStateProviderSetup<boolean[]>('SendTerms')
