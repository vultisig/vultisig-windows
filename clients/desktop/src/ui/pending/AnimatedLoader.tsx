import { useRive } from '@rive-app/react-canvas';

export const AnimatedLoader = () => {
  const { RiveComponent } = useRive({
    src: '/rive-animations/connecting-with-server',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  return <RiveComponent />;
};
