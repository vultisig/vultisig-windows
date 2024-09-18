import { useMutation, useQueryClient } from '@tanstack/react-query';
import jsQR from 'jsqr';
import { useNavigate } from 'react-router-dom';

import { KeygenMessage } from '../../../gen/vultisig/keygen/v1/keygen_message_pb';
import { ReshareMessage } from '../../../gen/vultisig/keygen/v1/reshare_message_pb';
import { KeysignMessage } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { match } from '../../../lib/utils/match';
import { getRawQueryParams } from '../../../lib/utils/query/getRawQueryParams';
import { makeAppPath } from '../../../navigation';
import { decompressQrPayload } from './utils/decompressQrPayload';

type QrTssType = 'Keygen' | 'Reshare';

type QrType = 'NewVault' | 'SignTransaction';

type QrSharedData = {
  jsonData: string;
  vault: string;
};

type QrQueryParams = QrSharedData & {
  type: QrType;
} & {
  tssType: QrTssType;
} & {
  vault: string;
};

export const useProcessQrMutation = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: async (file: File) => {
      const imageBitmap = await createImageBitmap(file);

      // Create a canvas to draw the image
      const canvas = document.createElement('canvas');
      canvas.width = imageBitmap.width;
      canvas.height = imageBitmap.height;

      const context = canvas.getContext('2d');
      if (!context) {
        throw new Error('Could not get canvas context');
      }

      context.drawImage(imageBitmap, 0, 0);

      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);

      const code = jsQR(imageData.data, imageData.width, imageData.height);

      if (!code) {
        throw new Error('Failed to read QR code');
      }

      const url = code.data;
      console.log('url:', url);
      const queryParams = getRawQueryParams<QrQueryParams>(url);
      const { jsonData } = queryParams;
      const payload = await decompressQrPayload(jsonData);

      if ('type' in queryParams) {
        return match(queryParams.type, {
          NewVault: async () => {
            match(queryParams.tssType, {
              Keygen: async () => {
                const keygenMsg = KeygenMessage.fromBinary(payload);
                queryClient.setQueryData(
                  ['keygenMessage', keygenMsg.sessionId],
                  keygenMsg
                );

                navigate(
                  makeAppPath('joinKeygen', {
                    keygenType: queryParams.tssType,
                    sessionID: keygenMsg.sessionId,
                  })
                );
              },
              Reshare: async () => {
                const reshareMsg = ReshareMessage.fromBinary(payload);
                queryClient.setQueryData(
                  ['reshareMessage', reshareMsg.sessionId],
                  reshareMsg
                );
                navigate(
                  makeAppPath('joinKeygen', {
                    keygenType: queryParams.tssType,
                    sessionID: reshareMsg.sessionId,
                  })
                );
              },
            });
          },
          SignTransaction: async () => {
            const vault = queryParams.vault;
            const keySignMsg = KeysignMessage.fromBinary(payload);
            queryClient.setQueryData(
              ['keysignMessage', keySignMsg.sessionId],
              keySignMsg
            );
            navigate(
              makeAppPath('joinKeysign', {
                publicKeyECDSA: vault,
                sessionID: keySignMsg.sessionId,
              })
            );
          },
        });
      } else {
        return;
      }
    },
  });
};
