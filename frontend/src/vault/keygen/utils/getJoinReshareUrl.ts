import { deepLinkBaseUrl } from '../../../constants';
import { ReshareMessage } from '../../../gen/vultisig/keygen/v1/reshare_message_pb';
import { toCompressedString } from '../../../utils/protobuf/toCompressedString';
import { KeygenServerType } from '../KeygenServerType';

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

export const getJoinReshareUrl = ({
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
  const keygenMessage = new ReshareMessage({
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

  const jsonData = toCompressedString(keygenMessage);

  return `${deepLinkBaseUrl}?type=NewVault&tssType=Reshare&jsonData=${jsonData}`;
};
