import { VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import styled from 'styled-components'

import { FramedQrCode } from '../../lib/ui/qr/FramedQrCode'
import { ProductLogo } from '../logo/ProductLogo'

const Container = styled(VStack)`
  align-items: center;
  padding: 40px 20px;
  background: ${getColor('background')};
  gap: 40px;
  min-width: 480px;
`

const Footer = styled(VStack)`
  gap: 20px;
  align-items: center;
  justify-content: space-between;
  font-weight: 600;
`

const Logo = styled(ProductLogo)`
  font-size: 80px;
`

type PrintableQrCodeProps = {
  value: string
  title?: string
  description?: string
}

export const PrintableQrCode = ({
  value,
  title,
  description,
}: PrintableQrCodeProps) => {
  return (
    <Container>
      <VStack>
        <FramedQrCode value={value} />
      </VStack>

      <Footer>
        <Text color="contrast" size={14} family="mono">
          {title}
        </Text>
        {description && (
          <Text color="contrast" size={14} family="mono">
            {description}
          </Text>
        )}
        <Logo />
      </Footer>
    </Container>
  )
}
