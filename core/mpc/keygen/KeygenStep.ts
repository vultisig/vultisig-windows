export const keygenSteps = [
  'prepareVault',
  'ecdsa',
  'eddsa',
  'frozt',
  'fromt',
  'chainKeys',
  'mldsa',
] as const

export type KeygenStep = (typeof keygenSteps)[number]
