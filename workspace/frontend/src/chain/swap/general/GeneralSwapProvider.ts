export const generalSwapProvides = ['oneinch', 'lifi'] as const;
export type GeneralSwapProvider = (typeof generalSwapProvides)[number];

export const generalSwapProviderName: Record<GeneralSwapProvider, string> = {
  oneinch: '1inch',
  lifi: 'LI.FI',
};
