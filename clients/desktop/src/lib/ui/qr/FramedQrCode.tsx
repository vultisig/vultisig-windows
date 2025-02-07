import { useRive } from '@rive-app/react-canvas';
import { ComponentProps } from 'react';
import QRCode from 'react-qr-code';
import styled from 'styled-components';

import { ValueProp } from '../../../lib/ui/props';

const DEFAULT_QR_CODE_SIZE = 365;

const Wrapper = styled.div<{
  size: number;
}>`
  position: relative;
  box-sizing: border-box;
  width: ${({ size }) => size}px;
  padding: 24px;
`;

const RiveWrapper = styled.div`
  position: absolute;
  inset: -9px;
  z-index: -1;
`;

type FramedQrCode = ValueProp<string> &
  Omit<ComponentProps<typeof Wrapper>, 'size'> & {
    size?: number;
  };

export const FramedQrCode = ({ size, value }: FramedQrCode) => {
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-secure-vault/qr-scanned.riv',
    autoplay: true,
  });

  return (
    <Wrapper size={size ?? DEFAULT_QR_CODE_SIZE}>
      <RiveWrapper>
        <RiveComponent />
      </RiveWrapper>
      <div>
        <QRCode size={size ?? DEFAULT_QR_CODE_SIZE} value={value} />
      </div>
    </Wrapper>
  );
};
