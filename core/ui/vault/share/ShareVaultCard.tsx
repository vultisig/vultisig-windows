import { productRootDomain } from '@core/config'
import { VaultKey } from '@core/ui/vault/share/VaultKey'
import { useCurrentVault } from '@core/ui/vault/state/currentVault'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import { VStack, vStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

import { getVaultExportUid } from '../export/core/uid'

const cardWidth = 345
const qrCodeSize = cardWidth - 105

const Container = styled.div`
  max-width: ${toSizeUnit(cardWidth)};
  border-radius: 24px;
  border: 1px solid ${getColor('foregroundExtra')};
  background: rgba(6, 27, 58, 0.6);

  width: 100%;
  padding: 24px;
  ${borderRadius.l};
  color: ${getColor('contrast')};

  ${vStack({
    gap: 20,
    alignItems: 'center',
  })}

  displaY: flex;
  flex-direction: column;
  gap: 12px;
`

const QrCodeWrapper = styled.div`
  position: relative;
  ${centerContent};
  padding: 24px;
  width: 270px;
  height: 270px;
  border-radius: 27.692px;
  border: 1px solid ${getColor('foregroundExtra')};

  & > svg {
    border-radius: 27.692px;
  }
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
        <Text weight={500} height="large" size={16} cropped>
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
      </QrCodeWrapper>
      <Text color="shyExtra" weight={500} size={13} cropped>
        {productRootDomain}
      </Text>
    </Container>
  )
}
