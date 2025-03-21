import { ValueProp } from '@lib/ui/props'
import { useRive } from '@rive-app/react-canvas'
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
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-secure-vault/qr-scanned.riv',
    autoplay: true,
  })

  return (
    <Wrapper scale={scale}>
      <RiveWrapper>
        <RiveComponent />
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
