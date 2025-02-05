import { useRive } from '@rive-app/react-canvas';

export const AnimatedLoader = () => {
  const { RiveComponent } = useRive({
    src: '/rive-animations/fast-vault-keygen.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  return <RiveComponent />;
};
