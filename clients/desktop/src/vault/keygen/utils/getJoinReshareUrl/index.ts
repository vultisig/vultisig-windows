import { create, toBinary } from '@bufbuild/protobuf';
import { ReshareMessageSchema } from '@core/communication/vultisig/keygen/v1/reshare_message_pb';
import { addQueryParams } from '@lib/utils/query/addQueryParams';

import { deepLinkBaseUrl } from '../../../../deeplink/config';
import { toCompressedString } from '../../../../utils/protobuf/toCompressedString';
import { KeygenServerType } from '../../server/KeygenServerType';

export type GetJoinReshareUrlInput = {
  serverType: KeygenServerType;
  vaultName: string;
  serviceName: string;
  sessionId: string;
  hexEncryptionKey: string;
  hexChainCode: string;
  publicKeyEcdsa: string;
  oldResharePrefix?: string;
  oldParties: string[];
};

export const getJoinReshareUrl = async ({
  serverType,
  vaultName,
  serviceName,
  sessionId,
  hexEncryptionKey,
  hexChainCode,
  publicKeyEcdsa,
  oldResharePrefix = '',
  oldParties,
}: GetJoinReshareUrlInput) => {
  const keygenMessage = create(ReshareMessageSchema, {
    sessionId,
    hexChainCode,
    serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    vaultName: vaultName,
    publicKeyEcdsa,
    oldResharePrefix,
    oldParties,
  });

  const binary = toBinary(ReshareMessageSchema, keygenMessage);

  const jsonData = await toCompressedString(binary);

  return addQueryParams(deepLinkBaseUrl, {
    type: 'NewVault',
    tssType: 'Reshare',
    jsonData,
  });
};
