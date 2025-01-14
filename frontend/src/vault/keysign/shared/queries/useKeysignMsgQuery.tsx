import { useQuery } from '@tanstack/react-query';

import { deepLinkBaseUrl } from '../../../../deeplink/config';
import { KeysignMessage } from '../../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { matchRecordUnion } from '../../../../lib/utils/matchRecordUnion';
import { addQueryParams } from '../../../../lib/utils/query/addQueryParams';
import { toCompressedString } from '../../../../utils/protobuf/toCompressedString';
import { useCurrentServiceName } from '../../../keygen/shared/state/currentServiceName';
import { useCurrentSessionId } from '../../../keygen/shared/state/currentSessionId';
import { useCurrentServerType } from '../../../keygen/state/currentServerType';
import { useCurrentHexEncryptionKey } from '../../../setup/state/currentHexEncryptionKey';
import { useCurrentVault } from '../../../state/currentVault';
import { getStorageVaultId } from '../../../utils/storageVault';
import { useKeysignMessagePayload } from '../state/keysignMessagePayload';

export const useKeysignMsgQuery = () => {
  const sessionId = useCurrentSessionId();
  const [serverType] = useCurrentServerType();
  const serviceName = useCurrentServiceName();
  const hexEncryptionKey = useCurrentHexEncryptionKey();
  const payload = useKeysignMessagePayload();
  const vault = useCurrentVault();

  return useQuery({
    queryKey: [
      'keysignMsg',
      serverType,
      serviceName,
      sessionId,
      hexEncryptionKey,
      payload,
    ],
    queryFn: async () => {
      const keysignMessage = new KeysignMessage({
        sessionId: sessionId,
        serviceName: serviceName,
        encryptionKeyHex: hexEncryptionKey,
        useVultisigRelay: serverType === 'relay',
      });

      matchRecordUnion(payload, {
        keysign: keysignPayload => {
          keysignMessage.keysignPayload = keysignPayload;
        },
        custom: customPayload => {
          keysignMessage.customMessagePayload = customPayload;
        },
      });

      const jsonData = await toCompressedString(keysignMessage);

      return addQueryParams(deepLinkBaseUrl, {
        type: 'SignTransaction',
        vault: getStorageVaultId(vault),
        jsonData,
      });
    },
    meta: {
      disablePersist: true,
    },
  });
};
