import { useEffect, useState } from 'react';

const SCALE_NORMAL = 1;
const SCALE_SMALL = 0.75;

export const useQRCodeScaleFactor = ({ enabled }: { enabled: boolean }) => {
  const [scale, setScale] = useState(SCALE_NORMAL);

  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) {
        // User is scrolling UP (negative deltaY)
        setScale(SCALE_SMALL);
      } else {
        setScale(SCALE_NORMAL);
      }
    };

    window.addEventListener('wheel', handleWheel);
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return scale;
};
