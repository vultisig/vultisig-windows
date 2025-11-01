import { match } from '@lib/utils/match'
import { matchRecordUnion } from '@lib/utils/matchRecordUnion'

import { KeygenOperation } from '../../keygen/KeygenOperation'
import { KeygenMessageSchema } from '../vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessageSchema } from '../vultisig/keygen/v1/reshare_message_pb'

export type TssType = 'Keygen' | 'Reshare' | 'Migrate' | 'KeyImport'

export const toTssType = (operation: KeygenOperation): TssType => {
  return matchRecordUnion<KeygenOperation, TssType>(operation, {
    create: () => 'Keygen',
    reshare: reshareType => {
      return match(reshareType, {
        regular: () => 'Reshare',
        migrate: () => 'Migrate',
        plugin: () => 'Reshare',
      })
    },
    keyimport: () => 'KeyImport',
  })
}

export const fromTssType = (tssType: TssType): KeygenOperation => {
  return match<TssType, KeygenOperation>(tssType, {
    Keygen: () => ({ create: true }),
    Migrate: () => ({ reshare: 'migrate' }),
    Reshare: () => ({ reshare: 'regular' }),
    KeyImport: () => ({ keyimport: true }),
  })
}

export const tssMessageSchema = {
  Keygen: KeygenMessageSchema,
  Reshare: ReshareMessageSchema,
  Migrate: ReshareMessageSchema,
  KeyImport: KeygenMessageSchema,
} as const
