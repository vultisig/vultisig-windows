import { KeygenMessage } from '@core/communication/vultisig/keygen/v1/keygen_message_pb';
import { ReshareMessage } from '@core/communication/vultisig/keygen/v1/reshare_message_pb';

export enum KeygenType {
  Keygen = 'Keygen',
  Reshare = 'Reshare',
}

export const keygenMsgRecord = {
  Keygen: KeygenMessage,
  Reshare: ReshareMessage,
};
