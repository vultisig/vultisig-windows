import styled from 'styled-components';
import { VStack } from '../../../lib/ui/layout/Stack';
import { getColor } from '../../../lib/ui/theme/getters';
import { ComponentWithValueProps } from '../../../lib/ui/props';
import { verticalPadding } from '../../../lib/ui/css/verticalPadding';
import { Text } from '../../../lib/ui/text';
import { ProductLogo } from '../../../ui/logo/ProductLogo';
import { ElementSizeAware } from '../../../lib/ui/base/ElementSizeAware';
import { AddressQrCode } from './AddressQrCode';

const Container = styled(VStack)`
  align-items: center;
  padding: 40px 20px;
  background: ${getColor('background')};
  gap: 40px;
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

export const PrintableAddressQrCode = ({
  value,
}: ComponentWithValueProps<string>) => {
  return (
    <Container>
      <ElementSizeAware
        render={({ setElement, size }) => (
          <VStack fullWidth ref={setElement}>
            {size && <AddressQrCode value={value} size={size.width} />}
          </VStack>
        )}
      />
      <Footer>
        <Text color="contrast" size={14} family="mono">
          {value}
        </Text>
        <Logo />
      </Footer>
    </Container>
  );
};
