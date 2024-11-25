import { deepLinkBaseUrl } from '../../../../constants';
import { KeygenMessage } from '../../../../gen/vultisig/keygen/v1/keygen_message_pb';
import { addQueryParams } from '../../../../lib/utils/query/addQueryParams';
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
  const keygenMessage = new KeygenMessage({
    sessionId,
    hexChainCode,
    serviceName,
    encryptionKeyHex: hexEncryptionKey,
    useVultisigRelay: serverType === 'relay',
    vaultName: vaultName,
  });

  const jsonData = await toCompressedString(keygenMessage);

  return addQueryParams(deepLinkBaseUrl, {
    type: 'NewVault',
    tssType: 'Keygen',
    jsonData,
  });
};
