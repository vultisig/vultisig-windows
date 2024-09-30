import styled from 'styled-components';

import { ElementSizeAware } from '../../lib/ui/base/ElementSizeAware';
import { verticalPadding } from '../../lib/ui/css/verticalPadding';
import { VStack } from '../../lib/ui/layout/Stack';
import {
  ComponentWithValueProps,
  TitledComponentProps,
} from '../../lib/ui/props';
import { FramedQrCode } from '../../lib/ui/qr/FramedQrCode';
import { Text } from '../../lib/ui/text';
import { getColor } from '../../lib/ui/theme/getters';
import { ProductLogo } from '../logo/ProductLogo';

const Container = styled(VStack)`
  align-items: center;
  padding: 40px 20px;
  background: ${getColor('background')};
  gap: 40px;
  min-width: 480px;
`;

const Footer = styled(VStack)`
  gap: 20px;
  align-items: center;
  font-weight: 600;
  ${verticalPadding(40)};
`;

const Logo = styled(ProductLogo)`
  font-size: 80px;
`;

export const PrintableQrCode = ({
  value,
  title,
}: ComponentWithValueProps<string> & TitledComponentProps) => {
  return (
    <Container>
      <ElementSizeAware
        render={({ setElement, size }) => (
          <VStack fullWidth ref={setElement}>
            {size && <FramedQrCode value={value} size={size.width} />}
          </VStack>
        )}
      />
      <Footer>
        <Text color="contrast" size={14} family="mono">
          {title}
        </Text>
        <Logo />
      </Footer>
    </Container>
  );
};
