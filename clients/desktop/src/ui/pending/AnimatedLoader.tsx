import { useRive } from '@rive-app/react-canvas';
import styled from 'styled-components';

import { ClassNameProp } from '../../lib/ui/props';

export const AnimatedLoader = ({ className }: ClassNameProp) => {
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-fast-vault/connecting-with-server.riv',
    stateMachines: 'State Machine 1',
    autoplay: true,
  });

  return (
    <LoaderWrapper className={className}>
      <RiveComponent />
    </LoaderWrapper>
  );
};

const LoaderWrapper = styled.div`
  position: relative;
  width: 48px;
  height: 48px;
`;
