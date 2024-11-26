import { useMutation } from '@tanstack/react-query';
import jsQR from 'jsqr';

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';

export const useProcessQrMutation = () => {
  const navigate = useAppNavigate();

  return useMutation({
    mutationFn: async (file: File) => {
      const imageBitmap = await createImageBitmap(file);

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
      navigate('deeplink', { state: { url } });
    },
  });
};
