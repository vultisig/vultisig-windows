import { toSizeUnit } from '@lib/ui/css/toSizeUnit'
import styled from 'styled-components'

import { qrCodeDefaultSize } from './config'

export const Wrapper = styled.div<{
  scale: number
}>`
  position: relative;
  box-sizing: border-box;
  width: ${toSizeUnit(qrCodeDefaultSize)};
  padding: 24px;
  transition: transform 0.3s ease-in-out;
  transform: scale(${({ scale }) => scale});
`

export const RiveWrapper = styled.div`
  position: absolute;
  inset: -9px;
`

export const QRCodeWrapper = styled.div`
  position: relative;
`
