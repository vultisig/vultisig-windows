import { useMutation } from '@tanstack/react-query';

import { useAppNavigate } from '../../../navigation/hooks/useAppNavigate';
import { readQrCode } from './utils/readQrCode';

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

      const url = readQrCode({
        canvasContext: context,
        image: imageBitmap,
      });

      navigate('deeplink', { state: { url } });
    },
  });
};
