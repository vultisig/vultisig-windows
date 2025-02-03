import { create, toBinary } from '@bufbuild/protobuf';
import { KeygenMessageSchema } from '@core/communication/vultisig/keygen/v1/keygen_message_pb';
import { addQueryParams } from '@lib/utils/query/addQueryParams';

import { deepLinkBaseUrl } from '../../../../deeplink/config';
import { toCompressedString } from '../../../../utils/protobuf/toCompressedString';
import { KeygenServerType } from '../../server/KeygenServerType';

export type GetJoinKeygenUrlInput = {
  serverType: KeygenServerType;
  vaultName: string;
  serviceName: string;
  sessionId: string;
  hexEncryptionKey: string;
  hexChainCode: string;
};

export const getJoinKeygenUrl = async ({
  serverType,
  vaultName,
  serviceName,
  sessionId,
  hexEncryptionKey,
  hexChainCode,
}: GetJoinKeygenUrlInput) => {
  const keygenMessage = create(KeygenMessageSchema, {
    sessionId,
    hexChainCode,
    serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    vaultName: vaultName,
  });

  const binary = toBinary(KeygenMessageSchema, keygenMessage);

  const jsonData = await toCompressedString(binary);

  return addQueryParams(deepLinkBaseUrl, {
    type: 'NewVault',
    tssType: 'Keygen',
    jsonData,
  });
};
