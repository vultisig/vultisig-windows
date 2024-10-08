import { useMutation } from '@tanstack/react-query';
import jsQR from 'jsqr';
import { useNavigate } from 'react-router-dom';

import { KeysignMessage } from '../../../gen/vultisig/keysign/v1/keysign_message_pb';
import { match } from '../../../lib/utils/match';
import { getRawQueryParams } from '../../../lib/utils/query/getRawQueryParams';
import { makeAppPath } from '../../../navigation';
import { keygenMsgRecord, KeygenType } from '../../keygen/KeygenType';
import { decompressQrPayload } from './utils/decompressQrPayload';

type QrType = 'NewVault' | 'SignTransaction';

type QrSharedData = {
  jsonData: string;
  vault: string;
};

type QrQueryParams = QrSharedData & {
  type: QrType;
} & {
  tssType: KeygenType;
} & {
  vault: string;
};

export const useProcessQrMutation = () => {
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
      const queryParams = getRawQueryParams<QrQueryParams>(url);
      const { jsonData } = queryParams;
      const payload = await decompressQrPayload(jsonData);

      if ('type' in queryParams) {
        const path = await match(queryParams.type, {
          NewVault: async () => {
            const keygenType = queryParams.tssType;

            const { fromBinary } = keygenMsgRecord[keygenType];

            const keygenMsg = JSON.stringify(fromBinary(payload).toJson());

            return makeAppPath('joinKeygen', {
              keygenType,
              keygenMsg,
            });
          },
          SignTransaction: async () => {
            const vaultId = queryParams.vault;

            const keysignMsg = JSON.stringify(
              KeysignMessage.fromBinary(payload).toJson()
            );

            return makeAppPath('joinKeysign', {
              keysignMsg,
              vaultId,
            });
          },
        });

        navigate(path);
      }
    },
  });
};
