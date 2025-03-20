import { KeygenMessageSchema } from '@core/mpc/types/vultisig/keygen/v1/keygen_message_pb'
import { ReshareMessageSchema } from '@core/mpc/types/vultisig/keygen/v1/reshare_message_pb'

export enum KeygenType {
  Keygen = 'Keygen',
  Reshare = 'Reshare',
  Migrate = 'Migrate',
}

export const keygenMsgSchemaRecord = {
  Keygen: KeygenMessageSchema,
  Reshare: ReshareMessageSchema,
  Migrate: ReshareMessageSchema,
}
