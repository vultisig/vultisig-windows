import { Animation } from '@lib/ui/animations/Animation'
import { ValueProp } from '@lib/ui/props'
import { ComponentProps, useEffect } from 'react'
import QRCode from 'react-qr-code'

import { QRCodeWrapper, RiveWrapper, Wrapper } from './FramedQrCode.styled'

type FramedQrCode = ValueProp<string> & ComponentProps<typeof Wrapper>

export const FramedQrCode = ({ value }: FramedQrCode) => {
  useEffect(() => {
    if (import.meta.env.DEV) {
      console.info(`[QR_CODE_VALUE]:${value}`)
    }
  }, [value])

  return (
    <Wrapper
      data-testid="framed-qr-code"
      {...(import.meta.env.DEV && { 'data-qr-value': value })}
    >
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
}
