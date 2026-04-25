import { ProductLogo } from '@core/ui/product/ProductLogo'
import { HStack, VStack } from '@lib/ui/layout/Stack'
import { Text } from '@lib/ui/text'
import { getColor } from '@lib/ui/theme/getters'
import { Fragment, ReactNode } from 'react'
import QRCode from 'react-qr-code'
import styled, { useTheme } from 'styled-components'

/** Metadata row displayed inside the printable QR info card. */
export type PrintableQrCodeRow = {
  label: string
  value: ReactNode
}

type PrintableQrCodeProps = {
  value: string
  title: string
  brandLabel: string
  rows: PrintableQrCodeRow[]
}

const canvasWidth = 340
const canvasMinHeight = 620
const horizontalPadding = 30
const cardInnerWidth = canvasWidth - horizontalPadding * 2
const qrCardHeight = 277
const qrSize = 240

const Canvas = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: ${canvasWidth}px;
  min-height: ${canvasMinHeight}px;
  padding: 29px ${horizontalPadding}px 20px;
  background: ${getColor('foreground')};
`

const Stack = styled(VStack)`
  gap: 22px;
  align-items: center;
`

const QrCardFrame = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: ${cardInnerWidth}px;
  height: ${qrCardHeight}px;
  padding: 18px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 24px;
`

const InfoCard = styled(VStack)`
  width: ${cardInnerWidth}px;
  padding: 20px;
  border: 1px solid ${getColor('foregroundExtra')};
  border-radius: 24px;
  gap: 16px;
`

const Rows = styled(VStack)`
  gap: 14px;
  padding-top: 12px;
`

const Divider = styled.div`
  height: 1px;
  width: 100%;
  background: ${getColor('foregroundExtra')};
`

const Spacer = styled.div`
  flex-grow: 1;
  min-height: 28px;
`

const BrandLogoSquare = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 33px;
  height: 33px;
  border-radius: 8px;
  background: linear-gradient(180deg, #4879fd 0%, #0d39b1 100%);
  box-shadow: inset 0 0.82px 0.82px 0 rgba(255, 255, 255, 0.35);
  color: ${getColor('white')};
  font-size: 22px;
`

/**
 * Renders a printable QR card that matches the Share-QR Figma spec.
 * Used as the PNG source when the user saves a Join Keygen/Keysign/address QR.
 * The info card is hidden when `rows` is empty.
 */
export const PrintableQrCode = ({
  value,
  title,
  brandLabel,
  rows,
}: PrintableQrCodeProps) => {
  const { colors } = useTheme()

  return (
    <Canvas>
      <Stack>
        <QrCardFrame>
          <QRCode
            value={value}
            size={qrSize}
            bgColor="transparent"
            fgColor={colors.white.toCssValue()}
          />
        </QrCardFrame>
        {rows.length > 0 && (
          <InfoCard>
            <Text size={14} weight={500} color="regular" height={1.43}>
              {title}
            </Text>
            <Rows>
              {rows.map((row, index) => (
                <Fragment key={row.label}>
                  {index > 0 && <Divider />}
                  <HStack
                    justifyContent="space-between"
                    alignItems="center"
                    gap={8}
                  >
                    <Text size={12} weight={500} color="shy" height={1.333}>
                      {row.label}
                    </Text>
                    {typeof row.value === 'string' ? (
                      <Text
                        size={12}
                        weight={500}
                        color="regular"
                        height={1.333}
                      >
                        {row.value}
                      </Text>
                    ) : (
                      <HStack alignItems="center">{row.value}</HStack>
                    )}
                  </HStack>
                </Fragment>
              ))}
            </Rows>
          </InfoCard>
        )}
      </Stack>
      <Spacer />
      <VStack gap={10} alignItems="center">
        <BrandLogoSquare>
          <ProductLogo />
        </BrandLogoSquare>
        <Text size={14} weight={500} color="regular">
          {brandLabel}
        </Text>
      </VStack>
    </Canvas>
  )
}
