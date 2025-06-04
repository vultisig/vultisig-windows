import { KeygenOperation } from './KeygenOperation'

type UnionKeys<T> = T extends any ? keyof T : never

export type KeygenType = UnionKeys<KeygenOperation>
