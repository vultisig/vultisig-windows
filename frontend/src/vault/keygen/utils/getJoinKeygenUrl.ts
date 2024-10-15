import { deepLinkBaseUrl } from '../../../constants';
import { KeygenMessage } from '../../../gen/vultisig/keygen/v1/keygen_message_pb';
import { toCompressedString } from '../../../utils/protobuf/toCompressedString';
import { KeygenServerType } from '../KeygenServerType';

export type GetJoinKeygenUrlInput = {
  serverType: KeygenServerType;
  vaultName: string;
  serviceName: string;
  sessionId: string;
  hexEncryptionKey: string;
  hexChainCode: string;
};

export const getJoinKeygenUrl = ({
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

  const jsonData = toCompressedString(keygenMessage);

  return `${deepLinkBaseUrl}?type=NewVault&tssType=Keygen&jsonData=${jsonData}`;
};
