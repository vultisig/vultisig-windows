import { SuiMoveNormalizedType } from '@mysten/sui/client'

import { SuiCommand } from './types'

export type MoveCallKey = `${string}::${string}::${string}`

export const moveCallKey = (
  pkg: string,
  module: string,
  fn: string
): MoveCallKey => `${pkg}::${module}::${fn}` as MoveCallKey

/**
 * Strip wrapping `&` / `&mut` borrows — for type-hint purposes a `&Coin<T>`
 * and a `Coin<T>` behave the same.
 */
const unwrapRefs = (type: SuiMoveNormalizedType): SuiMoveNormalizedType => {
  if (typeof type === 'object') {
    if ('Reference' in type) return unwrapRefs(type.Reference)
    if ('MutableReference' in type) return unwrapRefs(type.MutableReference)
  }
  return type
}

/**
 * Short, readable rendering of a Move type for the UI. Drops package
 * addresses (since the surrounding context already shows them) and renders
 * generics with the same treatment recursively.
 */
export const renderMoveType = (type: SuiMoveNormalizedType): string => {
  const t = unwrapRefs(type)
  if (typeof t === 'string') return t.toLowerCase()
  if ('Vector' in t) return `vector<${renderMoveType(t.Vector)}>`
  if ('TypeParameter' in t) return `T${t.TypeParameter}`
  if ('Struct' in t) {
    const { module, name, typeArguments } = t.Struct
    const generics = typeArguments.length
      ? `<${typeArguments.map(renderMoveType).join(', ')}>`
      : ''
    return `${module}::${name}${generics}`
  }
  return 'unknown'
}

/**
 * Primitive class assignable to a Pure input. We only decode primitives —
 * Struct / Vector / Address types either come from objects or are too rich
 * to summarise as a single value.
 */
export type PurePrimitiveHint =
  | 'bool'
  | 'u8'
  | 'u16'
  | 'u32'
  | 'u64'
  | 'u128'
  | 'u256'
  | 'address'

const primitiveHintFor = (
  type: SuiMoveNormalizedType
): PurePrimitiveHint | null => {
  const t = unwrapRefs(type)
  if (typeof t === 'string') {
    switch (t) {
      case 'Bool':
        return 'bool'
      case 'U8':
        return 'u8'
      case 'U16':
        return 'u16'
      case 'U32':
        return 'u32'
      case 'U64':
        return 'u64'
      case 'U128':
        return 'u128'
      case 'U256':
        return 'u256'
      case 'Address':
        return 'address'
    }
  }
  return null
}

/**
 * Walk every MoveCall argument list and build a per-input type hint. When
 * multiple calls reference the same input we keep the first hint and drop
 * later ones (in practice they always agree).
 */
export type InputHint = {
  type: SuiMoveNormalizedType
  primitive: PurePrimitiveHint | null
  // `(callIndex, argIndex)` of the first MoveCall that referenced this input.
  via: { callIndex: number; argIndex: number }
}

export const collectInputHints = (
  commands: SuiCommand[],
  abis: Map<MoveCallKey, { parameters: SuiMoveNormalizedType[] }>
): Map<number, InputHint> => {
  const hints = new Map<number, InputHint>()
  commands.forEach((cmd, callIndex) => {
    if (cmd.kind !== 'MoveCall') return
    const key = moveCallKey(cmd.package, cmd.module, cmd.function)
    const abi = abis.get(key)
    if (!abi) return
    cmd.arguments.forEach((arg, argIndex) => {
      if (arg.kind !== 'Input') return
      if (hints.has(arg.index)) return
      const type = abi.parameters[argIndex]
      if (!type) return
      hints.set(arg.index, {
        type,
        primitive: primitiveHintFor(type),
        via: { callIndex, argIndex },
      })
    })
  })
  return hints
}
