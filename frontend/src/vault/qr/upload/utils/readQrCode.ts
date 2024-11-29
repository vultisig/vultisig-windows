import jsQR from 'jsqr';

type Input = {
  canvasContext: CanvasRenderingContext2D;
  image: CanvasImageSource;
};

export const readQrCode = ({ canvasContext, image }: Input) => {
  const { width, height } = canvasContext.canvas;

  canvasContext.drawImage(image, 0, 0, width, height);

  const imageData = canvasContext.getImageData(0, 0, width, height);

  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (!code) {
    throw new Error('Failed to read QR code');
  }

  return code.data;
};
