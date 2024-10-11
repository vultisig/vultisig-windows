import { ComponentProps } from 'react';
import QRCode from 'react-qr-code';
import styled from 'styled-components';

import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { toSizeUnit } from '../../../lib/ui/css/toSizeUnit';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { getColor } from '../../../lib/ui/theme/getters';

const codeOffset = 24;
const codePadding = 16;

const Wrapper = styled.div`
  ${borderRadius.l};
  background: ${getColor('foreground')};
  padding: ${toSizeUnit(codeOffset)};
  border: 5px dashed ${({ theme }) => theme.colors.primary.toCssValue()};
`;

const Container = styled.div`
  ${borderRadius.m};
  background: ${getColor('contrast')};
  padding: ${toSizeUnit(codePadding)};
`;

type FramedQrCode = ComponentWithValueProps<string> & {
  size: number;
} & ComponentProps<typeof Wrapper>;

export const FramedQrCode = ({ size, value }: FramedQrCode) => {
  return (
    <Wrapper>
      <Container>
        <QRCode size={size - (codeOffset + codePadding) * 2} value={value} />
      </Container>
    </Wrapper>
  );
};
