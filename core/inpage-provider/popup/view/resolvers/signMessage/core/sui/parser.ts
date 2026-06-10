import { bcs } from '@mysten/sui/bcs'
import { attempt } from '@vultisig/lib-utils/attempt'

import { SuiArgument, SuiCommand, SuiPtbInput, SuiTxData } from './types'

type ParsedTransactionData = ReturnType<typeof bcs.TransactionData.parse>

type ParsedKind = ParsedTransactionData['V1']['kind']
type ParsedPtb = Extract<
  ParsedKind,
  { $kind: 'ProgrammableTransaction' }
>['ProgrammableTransaction']
type ParsedArgument = ParsedPtb['commands'][number] extends {
  MoveCall?: { arguments: infer A }
}
  ? A extends Array<infer Item>
    ? Item
    : never
  : never
type ParsedInput = ParsedPtb['inputs'][number]
type ParsedCommand = ParsedPtb['commands'][number]

const normalizeArgument = (arg: ParsedArgument): SuiArgument => {
  switch (arg.$kind) {
    case 'GasCoin':
      return { kind: 'GasCoin' }
    case 'Input':
      return { kind: 'Input', index: arg.Input }
    case 'Result':
      return { kind: 'Result', index: arg.Result }
    case 'NestedResult':
      return {
        kind: 'NestedResult',
        commandIndex: arg.NestedResult[0],
        resultIndex: arg.NestedResult[1],
      }
  }
}

const normalizeInput = (input: ParsedInput): SuiPtbInput => {
  if (input.$kind === 'Pure') {
    return { kind: 'pure', bytes: input.Pure.bytes }
  }
  const obj = input.Object
  switch (obj.$kind) {
    case 'ImmOrOwnedObject':
      return {
        kind: 'object',
        objectKind: 'ImmOrOwnedObject',
        objectId: obj.ImmOrOwnedObject.objectId,
        version: obj.ImmOrOwnedObject.version,
        digest: obj.ImmOrOwnedObject.digest,
      }
    case 'SharedObject':
      return {
        kind: 'object',
        objectKind: 'SharedObject',
        objectId: obj.SharedObject.objectId,
        initialSharedVersion: obj.SharedObject.initialSharedVersion,
        mutable: obj.SharedObject.mutable,
      }
    case 'Receiving':
      return {
        kind: 'object',
        objectKind: 'Receiving',
        objectId: obj.Receiving.objectId,
        version: obj.Receiving.version,
        digest: obj.Receiving.digest,
      }
  }
}

const normalizeCommand = (command: ParsedCommand): SuiCommand => {
  switch (command.$kind) {
    case 'MoveCall':
      return {
        kind: 'MoveCall',
        package: command.MoveCall.package,
        module: command.MoveCall.module,
        function: command.MoveCall.function,
        typeArguments: command.MoveCall.typeArguments,
        arguments: command.MoveCall.arguments.map(normalizeArgument),
      }
    case 'TransferObjects':
      return {
        kind: 'TransferObjects',
        objects: command.TransferObjects.objects.map(normalizeArgument),
        address: normalizeArgument(command.TransferObjects.address),
      }
    case 'SplitCoins':
      return {
        kind: 'SplitCoins',
        coin: normalizeArgument(command.SplitCoins.coin),
        amounts: command.SplitCoins.amounts.map(normalizeArgument),
      }
    case 'MergeCoins':
      return {
        kind: 'MergeCoins',
        destination: normalizeArgument(command.MergeCoins.destination),
        sources: command.MergeCoins.sources.map(normalizeArgument),
      }
    case 'Publish':
      return {
        kind: 'Publish',
        moduleCount: command.Publish.modules.length,
        dependencyCount: command.Publish.dependencies.length,
      }
    case 'MakeMoveVec':
      return {
        kind: 'MakeMoveVec',
        type: command.MakeMoveVec.type,
        elements: command.MakeMoveVec.elements.map(normalizeArgument),
      }
    case 'Upgrade':
      return {
        kind: 'Upgrade',
        moduleCount: command.Upgrade.modules.length,
        dependencyCount: command.Upgrade.dependencies.length,
        package: command.Upgrade.package,
        ticket: normalizeArgument(command.Upgrade.ticket),
      }
  }
}

/**
 * Decode a base64 Sui PTB (`TransactionData` BCS) into a typed `SuiTxData` for
 * popup display. Returns `null` if the bytes don't parse as `TransactionData`
 * V1 with a Programmable transaction kind — the popup falls back to rendering
 * the raw base64 in that case.
 */
export const parseSuiTx = (
  transactionBytesBase64: string
): SuiTxData | null => {
  const result = attempt(() => {
    const bytes = Buffer.from(transactionBytesBase64, 'base64')
    const decoded = bcs.TransactionData.parse(new Uint8Array(bytes))
    const v1 = decoded.V1
    const kind = v1.kind
    if (kind.$kind !== 'ProgrammableTransaction') {
      return null
    }
    const ptb = kind.ProgrammableTransaction
    const data: SuiTxData = {
      sender: v1.sender,
      gasData: {
        payment: v1.gasData.payment,
        owner: v1.gasData.owner,
        price: v1.gasData.price,
        budget: v1.gasData.budget,
      },
      inputs: ptb.inputs.map(normalizeInput),
      commands: ptb.commands.map(normalizeCommand),
    }
    return data
  })
  return 'data' in result ? (result.data ?? null) : null
}
