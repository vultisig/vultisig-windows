export const mpcLibs = ['GG20', 'DKLS'] as const

export type MpcLib = (typeof mpcLibs)[number]

export const defaultMpcLib: MpcLib = 'GG20'
