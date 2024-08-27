import { useMutation } from '@tanstack/react-query';
import jsQR from 'jsqr';
import { getRawQueryParams } from '../../../lib/utils/query/getRawQueryParams';
import { decompressQrPayload } from './utils/decompressQrPayload';

type QrTtsType = 'Keygen' | 'Reshare';

type QrType = 'NewVault' | 'Keysign';

type QrSharedData = {
  jsonData: string;
  vault: string;
};

type QrQueryParams =
  | (QrSharedData & {
      type: QrType;
    })
  | (QrSharedData & {
      ttsType: QrTtsType;
    });

export const useProcessQrMutation = () => {
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
      console.log(payload);

      if ('type' in queryParams) {
        console.log('payload with type');
      } else {
        console.log('payload with ttsType');
      }
    },
  });
};
