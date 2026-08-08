/**
 * Decoded Sui PTB shape rendered by the signMessage popup's Sui display.
 *
 * Mirrors the @mysten/sui/bcs TransactionData V1 + ProgrammableTransaction
 * structure but flattens the discriminated unions into objects keyed by a
 * `kind` discriminant that's easier to drive a UI from.
 */

export type SuiPureInput = {
  kind: 'pure'
  // base64 of the raw BCS bytes for the pure value
  bytes: string
}

export type SuiObjectInput =
  | {
      kind: 'object'
      objectKind: 'ImmOrOwnedObject' | 'Receiving'
      objectId: string
      version: string
      digest: string
    }
  | {
      kind: 'object'
      objectKind: 'SharedObject'
      objectId: string
      initialSharedVersion: string
      mutable: boolean
    }

export type SuiPtbInput = SuiPureInput | SuiObjectInput

export type SuiArgument =
  | { kind: 'GasCoin' }
  | { kind: 'Input'; index: number }
  | { kind: 'Result'; index: number }
  | { kind: 'NestedResult'; commandIndex: number; resultIndex: number }

export type SuiCommand =
  | {
      kind: 'MoveCall'
      package: string
      module: string
      function: string
      typeArguments: string[]
      arguments: SuiArgument[]
    }
  | {
      kind: 'TransferObjects'
      objects: SuiArgument[]
      address: SuiArgument
    }
  | {
      kind: 'SplitCoins'
      coin: SuiArgument
      amounts: SuiArgument[]
    }
  | {
      kind: 'MergeCoins'
      destination: SuiArgument
      sources: SuiArgument[]
    }
  | {
      kind: 'Publish'
      moduleCount: number
      dependencyCount: number
    }
  | {
      kind: 'MakeMoveVec'
      type: string | null
      elements: SuiArgument[]
    }
  | {
      kind: 'Upgrade'
      moduleCount: number
      dependencyCount: number
      package: string
      ticket: SuiArgument
    }

export type SuiGasData = {
  payment: { objectId: string; version: string; digest: string }[]
  owner: string
  /** Gas price in MIST (1 SUI = 10^9 MIST). */
  price: string
  /** Gas budget in MIST. */
  budget: string
}

export type SuiTxData = {
  sender: string
  gasData: SuiGasData
  inputs: SuiPtbInput[]
  commands: SuiCommand[]
}
