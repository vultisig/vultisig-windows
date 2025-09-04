export const generalSwapProviders = ['1inch', 'li.fi', 'kyber'] as const

export type GeneralSwapProvider = (typeof generalSwapProviders)[number]

export const generalSwapProviderName: Record<GeneralSwapProvider, string> = {
  '1inch': '1Inch',
  'li.fi': 'LI.FI',
  kyber: 'KyberSwap',
}
