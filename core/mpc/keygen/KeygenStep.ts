export const keygenSteps = ['prepareVault', 'ecdsa', 'eddsa', 'mldsa'] as const

export type KeygenStep = (typeof keygenSteps)[number]
