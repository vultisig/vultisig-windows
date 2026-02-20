export type MpcLib = 'GG20' | 'DKLS'

/** MpcLib plus KeyImport; used in keysign payloads (protobuf uses string on wire). */
export type KeysignLibType = MpcLib | 'KeyImport'

export const defaultMpcLib: MpcLib = 'DKLS'
