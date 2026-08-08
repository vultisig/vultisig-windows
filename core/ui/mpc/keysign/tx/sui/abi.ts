import { Experimental_SuiClientTypes } from '@mysten/sui/experimental'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

import { SuiCommand } from './types'

/**
 * A Move function parameter as the gRPC client reports it. Borrows live in the
 * separate `reference` field rather than wrapping the type, so type-hint logic
 * reads `body` directly — a `&Coin<T>` and a `Coin<T>` behave the same here.
 */
export type MoveParameter = Experimental_SuiClientTypes.OpenSignature

type MoveTypeBody = Experimental_SuiClientTypes.OpenSignatureBody

export type MoveCallKey = `${string}::${string}::${string}`

export const moveCallKey = (
  pkg: string,
  module: string,
  fn: string
): MoveCallKey => `${pkg}::${module}::${fn}` as MoveCallKey

const renderMoveTypeBody = (body: MoveTypeBody): string => {
  switch (body.$kind) {
    case 'vector':
      return `vector<${renderMoveTypeBody(body.vector)}>`
    case 'typeParameter':
      return `T${body.index}`
    case 'datatype': {
      const { typeName, typeParameters } = body.datatype
      // Drop the package address (the surrounding context already shows it):
      // `0x2::coin::Coin` renders as `coin::Coin`.
      const parts = typeName.split('::')
      const name = parts.length === 3 ? `${parts[1]}::${parts[2]}` : typeName
      const generics = typeParameters.length
        ? `<${typeParameters.map(renderMoveTypeBody).join(', ')}>`
        : ''
      return `${name}${generics}`
    }
    default:
      // Primitives and `unknown` carry their reading directly in `$kind`.
      return body.$kind
  }
}

/**
 * Short, readable rendering of a Move type for the UI. Drops package
 * addresses (since the surrounding context already shows them) and renders
 * generics with the same treatment recursively.
 */
export const renderMoveType = (type: MoveParameter): string =>
  renderMoveTypeBody(type.body)

/**
 * Primitive class assignable to a Pure input. We only decode primitives —
 * datatype / vector / type-parameter types either come from objects or are
 * too rich to summarise as a single value.
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

const purePrimitiveHints: readonly PurePrimitiveHint[] = [
  'bool',
  'u8',
  'u16',
  'u32',
  'u64',
  'u128',
  'u256',
  'address',
]

const primitiveHintFor = (type: MoveParameter): PurePrimitiveHint | null =>
  isOneOf(type.body.$kind, purePrimitiveHints) ? type.body.$kind : null

/**
 * Walk every MoveCall argument list and build a per-input type hint. When
 * multiple calls reference the same input we keep the first hint and drop
 * later ones (in practice they always agree).
 */
export type InputHint = {
  type: MoveParameter
  primitive: PurePrimitiveHint | null
  // `(callIndex, argIndex)` of the first MoveCall that referenced this input.
  via: { callIndex: number; argIndex: number }
}

export const collectInputHints = (
  commands: SuiCommand[],
  abis: Map<MoveCallKey, { parameters: MoveParameter[] }>
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
