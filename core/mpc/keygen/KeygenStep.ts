export const keygenSteps = [
  'prepareVault',
  'ecdsa',
  'eddsa',
  'chainKeys',
  'mldsa',
] as const

export type KeygenStep = (typeof keygenSteps)[number]
