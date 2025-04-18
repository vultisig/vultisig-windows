import { GenMessage } from '@bufbuild/protobuf/codegenv1'
import { mirrorRecord } from '@lib/utils/record/mirrorRecord'

import { KeygenType } from '../../keygen/KeygenType'
import { KeygenMessageSchema } from '../vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessageSchema } from '../vultisig/keygen/v1/reshare_message_pb'

export type TssType = 'Keygen' | 'Reshare' | 'Migrate'

const tssKeygenTypeRecord: Record<TssType, KeygenType> = {
  Keygen: 'create',
  Reshare: 'reshare',
  Migrate: 'migrate',
}

export const toTssType = (keygenType: KeygenType): TssType =>
  mirrorRecord(tssKeygenTypeRecord)[keygenType]

export const fromTssType = (tssType: TssType): KeygenType =>
  tssKeygenTypeRecord[tssType]

export const tssMessageSchema: Record<TssType, GenMessage<any>> = {
  Keygen: KeygenMessageSchema,
  Reshare: ReshareMessageSchema,
  Migrate: ReshareMessageSchema,
}
