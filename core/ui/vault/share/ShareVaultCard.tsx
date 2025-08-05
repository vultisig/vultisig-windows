import { ProductSimpleLogo } from '@core/ui/product/logo/ProductSimpleLogo'
import { VaultKey } from '@core/ui/vault/share/VaultKey'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import { getVaultExportUid } from '../export/core/uid'

const cardWidth = 320
const qrCodeSize = cardWidth - 80
const logoSize = 46

const Container = styled.div`
  background: linear-gradient(180deg, #33e6bf 0%, #0439c7 50%);
  max-width: ${toSizeUnit(cardWidth)};
  width: 100%;
  padding: 12px 20px;
  ${borderRadius.l};
  color: ${getColor('contrast')};

  ${vStack({
    gap: 20,
    alignItems: 'center',
  })}

  displaY: flex;
  flex-direction: column;
  gap: 32px;
`

const QrCodeWrapper = styled.div`
  position: relative;
  ${centerContent};
`

const LogoContainer = styled.div`
  position: absolute;
  background: ${getColor('contrast')};
  ${borderRadius.m};
  ${sameDimensions(logoSize)};
  ${centerContent};
  font-size: 24px;
`

export const ShareVaultCard = () => {
  const vault = useCurrentVault()
  const { name } = vault

  const uid = getVaultExportUid(vault)

  const qrCodeValue = JSON.stringify({
    uid,
    name: name,
    public_key_ecdsa: vault.publicKeys.ecdsa,
    public_key_eddsa: vault.publicKeys.eddsa,
    hex_chain_code: vault.hexChainCode,
  })

  const { colors } = useTheme()

  return (
    <Container>
      <VStack gap={4} alignItems="center">
        <Text weight={600} size={22} cropped>
          {name}
        </Text>
        <VaultKey title="UID" value={uid} />
      </VStack>
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
      <Text weight={500} size={20} cropped>
        vultisig.com
      </Text>
    </Container>
  )
}
