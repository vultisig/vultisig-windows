import QRCode from 'react-qr-code';
import styled from 'styled-components';
import { borderRadius } from '../../../lib/ui/css/borderRadius';
import { getColor } from '../../../lib/ui/theme/getters';
import { toSizeUnit } from '../../../lib/ui/css/toSizeUnit';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { ComponentProps } from 'react';

const codeOffset = 24;
const codePadding = 16;

const Wrapper = styled.div`
  ${borderRadius.l};
  background: ${getColor('foreground')};
  padding: ${toSizeUnit(codeOffset)};
`;

const Container = styled.div`
  ${borderRadius.m};
  background: ${getColor('contrast')};
  padding: ${toSizeUnit(codePadding)};
`;

type AddressQrCodeProps = ComponentWithValueProps<string> & {
  size: number;
} & ComponentProps<typeof Wrapper>;

export const AddressQrCode = ({ size, value }: AddressQrCodeProps) => {
  return (
    <Wrapper>
      <Container>
        <QRCode size={size - (codeOffset + codePadding) * 2} value={value} />
      </Container>
    </Wrapper>
  );
};
