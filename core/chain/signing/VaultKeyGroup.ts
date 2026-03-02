export const vaultKeyGroups = ['ecdsa', 'eddsa', 'frozt', 'mldsa'] as const

export type VaultKeyGroup = (typeof vaultKeyGroups)[number]

export const vaultKeyGroupLabel: Record<VaultKeyGroup, string> = {
  ecdsa: 'ECDSA',
  eddsa: 'EdDSA',
  frozt: 'FROZT',
  mldsa: 'ML-DSA',
}
