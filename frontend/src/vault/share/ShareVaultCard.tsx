import QRCode from 'react-qr-code';
import styled, { useTheme } from 'styled-components';

import { borderRadius } from '../../lib/ui/css/borderRadius';
import { centerContent } from '../../lib/ui/css/centerContent';
import { sameDimensions } from '../../lib/ui/css/sameDimensions';
import { toSizeUnit } from '../../lib/ui/css/toSizeUnit';
import { VStack, vStack } from '../../lib/ui/layout/Stack';
import { Text } from '../../lib/ui/text';
import { getColor } from '../../lib/ui/theme/getters';
import { ProductSimpleLogo } from '../../ui/logo/ProductSimpleLogo';
import { useAssertCurrentVault } from '../state/useCurrentVault';
import { getVaultPublicKeyExport } from './utils/getVaultPublicKeyEport';
import { VaultKey } from './VaultKey';

const cardWidth = 320;
const qrCodeSize = cardWidth - 80;
const logoSize = 46;

const Container = styled.div`
  background: linear-gradient(180deg, #33e6bf 0%, #0439c7 100%);
  max-width: ${toSizeUnit(cardWidth)};
  width: 100%;
  padding: 40px 20px;
  ${borderRadius.l};
  color: ${getColor('contrast')};

  ${vStack({
    gap: 20,
    alignItems: 'center',
  })}
`;

const QrCodeWrapper = styled.div`
  position: relative;
  ${centerContent};
`;

const LogoContainer = styled.div`
  position: absolute;
  background: ${getColor('contrast')};
  ${borderRadius.m};
  ${sameDimensions(logoSize)};
  ${centerContent};
  font-size: 24px;
`;

export const ShareVaultCard = () => {
  const vault = useAssertCurrentVault();

  const { name, public_key_ecdsa, public_key_eddsa } = vault;

  const qrCodeValue = JSON.stringify(getVaultPublicKeyExport(vault));

  const { colors } = useTheme();

  return (
    <Container>
      <QrCodeWrapper>
        <QRCode
          bgColor="transparent"
          fgColor={colors.white.toCssValue()}
          size={qrCodeSize}
          value={qrCodeValue}
        />
        <LogoContainer>
          <ProductSimpleLogo />
        </LogoContainer>
      </QrCodeWrapper>
      <VStack gap={12} alignItems="center">
        <Text weight={600} size={20} cropped>
          {name}
        </Text>
        <VaultKey title="ECDSA Key" value={public_key_ecdsa} />
        <VaultKey title="EdDSA Key" value={public_key_eddsa} />
      </VStack>
    </Container>
  );
};
