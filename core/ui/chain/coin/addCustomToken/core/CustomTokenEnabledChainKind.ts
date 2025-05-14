export const customTokenEnabledChainKinds = ['evm', 'solana'] as const
export type CustomTokenEnabledChainKind =
  (typeof customTokenEnabledChainKinds)[number]
