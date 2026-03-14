export type MpcLib = 'GG20' | 'DKLS' | 'KeyImport'

export type KeysignLibType = MpcLib

export const mpcLibOptions = ['GG20', 'DKLS', 'KeyImport'] as const

export const defaultMpcLib: MpcLib = 'DKLS'
