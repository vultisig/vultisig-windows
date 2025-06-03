import { GenMessage } from '@bufbuild/protobuf/codegenv1'
import { match } from '@lib/utils/match'
import { matchDiscriminatedUnion } from '@lib/utils/matchDiscriminatedUnion'

import { KeygenOperation } from '../../keygen/KeygenOperation'
import { KeygenMessageSchema } from '../vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessageSchema } from '../vultisig/keygen/v1/reshare_message_pb'

export type TssType = 'Keygen' | 'Reshare' | 'Migrate'

export const toTssType = (operation: KeygenOperation): TssType => {
  return matchDiscriminatedUnion<KeygenOperation, TssType>(
    operation,
    'operation',
    'type',
    {
      create: () => 'Keygen',
      reshare: () => 'Reshare',
      regular: () => 'Reshare',
      migrate: () => 'Migrate',
      plugin: () => 'Reshare',
    }
  )
}

export const fromTssType = (tssType: TssType): KeygenOperation => {
  return match<TssType, KeygenOperation>(tssType, {
    Keygen: () => ({ operation: 'create' }),
    Migrate: () => ({ operation: 'reshare', type: 'migrate' }),
    Reshare: () => ({ operation: 'reshare', type: 'regular' }),
  })
}

export const tssMessageSchema: Record<TssType, GenMessage<any>> = {
  Keygen: KeygenMessageSchema,
  Reshare: ReshareMessageSchema,
  Migrate: ReshareMessageSchema,
}
