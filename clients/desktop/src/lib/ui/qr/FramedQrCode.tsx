import { useRive } from '@rive-app/react-canvas'
import { ComponentProps } from 'react'
import QRCode from 'react-qr-code'

import { ValueProp } from '../../../lib/ui/props'
import { QRCodeWrapper, RiveWrapper, Wrapper } from './FramedQrCode.styled'
import { useQRCodeScaleFactor } from './hooks/useQRCodeScaleFactor'

const DEFAULT_QR_CODE_SIZE = 365

type FramedQrCode = ValueProp<string> &
  Omit<ComponentProps<typeof Wrapper>, 'size' | 'scale'> & {
    size?: number
    scaling?: boolean
  }

export const FramedQrCode = ({ size, value, scaling = true }: FramedQrCode) => {
  const scale = useQRCodeScaleFactor(scaling)
  const { RiveComponent } = useRive({
    src: '/assets/animations/keygen-secure-vault/qr-scanned.riv',
    autoplay: true,
  })

  return (
    <Wrapper scale={scale} size={size ?? DEFAULT_QR_CODE_SIZE}>
      <RiveWrapper>
        <RiveComponent />
      </RiveWrapper>
      <QRCodeWrapper>
        <QRCode
          fgColor="#FFFFFF"
          bgColor="#000000"
          size={size ?? DEFAULT_QR_CODE_SIZE}
          value={value}
        />
      </QRCodeWrapper>
    </Wrapper>
  )
}
