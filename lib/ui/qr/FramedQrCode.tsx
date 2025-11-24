import { Animation } from '@lib/ui/animations/Animation'
import { ValueProp } from '@lib/ui/props'
import { ComponentProps } from 'react'
import QRCode from 'react-qr-code'

import { QRCodeWrapper, RiveWrapper, Wrapper } from './FramedQrCode.styled'

type FramedQrCode = ValueProp<string> & ComponentProps<typeof Wrapper>

export const FramedQrCode = ({ value }: FramedQrCode) => (
  <Wrapper>
    <RiveWrapper>
      <Animation src="/core/animations/qr-scanned.riv" />
    </RiveWrapper>
    <QRCodeWrapper>
      <QRCode
        fgColor="#FFFFFF"
        bgColor="#000000"
        style={{ width: '100%', height: 'auto' }}
        value={value}
      />
    </QRCodeWrapper>
  </Wrapper>
)
