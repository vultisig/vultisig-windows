import { KeygenMessageSchema } from '@core/communication/vultisig/keygen/v1/keygen_message_pb';
import { ReshareMessageSchema } from '@core/communication/vultisig/keygen/v1/reshare_message_pb';

export enum KeygenType {
  Keygen = 'Keygen',
  Reshare = 'Reshare',
}

export const keygenMsgSchemaRecord = {
  Keygen: KeygenMessageSchema,
  Reshare: ReshareMessageSchema,
};
