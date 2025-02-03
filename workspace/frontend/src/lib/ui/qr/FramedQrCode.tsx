import { ComponentProps } from 'react';
import QRCode from 'react-qr-code';
import styled from 'styled-components';

import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { toSizeUnit } from '../../../lib/ui/css/toSizeUnit';
import { ValueProp } from '../../../lib/ui/props';
import { getColor } from '../../../lib/ui/theme/getters';

const DEFAULT_QR_CODE_SIZE = 365;
const codeOffset = 24;
const codePadding = 16;

const Wrapper = styled.div`
  box-sizing: border-box;
  ${borderRadius.l};
  background: ${getColor('foreground')};
  padding: ${toSizeUnit(codeOffset)};
  border: 5px dashed ${({ theme }) => theme.colors.primary.toCssValue()};
  width: DEFAULT_QR_CODE_SIZE + 'px';
`;

const Container = styled.div`
  ${borderRadius.m};
  background: ${getColor('contrast')};
  padding: ${toSizeUnit(codePadding)};
`;

type FramedQrCode = ValueProp<string> & {
  size?: number;
} & ComponentProps<typeof Wrapper>;

export const FramedQrCode = ({
  size = DEFAULT_QR_CODE_SIZE,
  value,
}: FramedQrCode) => {
  return (
    <Wrapper>
      <Container>
        <QRCode size={size} value={value} />
      </Container>
    </Wrapper>
  );
};
