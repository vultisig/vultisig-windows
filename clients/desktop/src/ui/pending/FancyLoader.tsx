import Lottie from 'lottie-react';

import loadingAnimation from './loadingAnimation.json';

export const FancyLoader = () => (
  <Lottie style={{ width: 120 }} animationData={loadingAnimation} loop={true} />
);
