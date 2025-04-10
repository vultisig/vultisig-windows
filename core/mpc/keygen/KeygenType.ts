import { GenMessage } from '@bufbuild/protobuf/dist/cjs/codegenv1/types'
import { KeygenMessageSchema } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessageSchema } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'

export type KeygenType = 'create' | 'reshare' | 'migrate'

export const keygenMsgSchemaRecord: Record<KeygenType, GenMessage<any>> = {
  create: KeygenMessageSchema,
  reshare: ReshareMessageSchema,
  migrate: ReshareMessageSchema,
}
