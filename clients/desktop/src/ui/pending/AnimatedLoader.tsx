import { useRive } from '@rive-app/react-canvas';

export const AnimatedLoader = () => {
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-fast-vault/connecting-with-server.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  return <RiveComponent />;
};
