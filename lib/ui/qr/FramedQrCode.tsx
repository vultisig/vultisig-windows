import { Animation } from '@lib/ui/animations/Animation'
import { ValueProp } from '@lib/ui/props'
import { ComponentProps } from 'react'
import QRCode from 'react-qr-code'

import { qrCodeDefaultSize } from './config'
import { QRCodeWrapper, RiveWrapper, Wrapper } from './FramedQrCode.styled'
import { useQRCodeScaleFactor } from './hooks/useQRCodeScaleFactor'

type FramedQrCode = ValueProp<string> &
  Omit<ComponentProps<typeof Wrapper>, 'size' | 'scale'> & {
    scaling?: boolean
  }

export const FramedQrCode = ({ value, scaling = true }: FramedQrCode) => {
  const scale = useQRCodeScaleFactor(scaling)

  return (
    <Wrapper scale={scale}>
      <RiveWrapper>
        <Animation src="/core/animations/qr-scanned.riv" />
      </RiveWrapper>
      <QRCodeWrapper>
        <QRCode
          fgColor="#FFFFFF"
          bgColor="#000000"
          size={qrCodeDefaultSize}
          value={value}
        />
      </QRCodeWrapper>
    </Wrapper>
  )
}
