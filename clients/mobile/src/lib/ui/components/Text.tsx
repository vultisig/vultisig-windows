import { FC, PropsWithChildren } from 'react'
import { Text as RNText, TextStyle } from 'react-native'
import styled, { css, DefaultTheme } from 'styled-components/native'

type TextVariant = 'h1Hero' | 'h1Regular'

const textVariantsRecord: Record<
  TextVariant,
  Pick<TextProps, 'size' | 'height' | 'weight' | 'cropped' | 'letterSpacing'>
> = {
  h1Hero: {
    size: 72,
    height: 'large',
    weight: '500',
    cropped: false,
  },
  h1Regular: {
    size: 60,
    height: 'large',
    weight: '500',
    cropped: false,
  },
}

const getTextColorRecord = (theme: DefaultTheme) => {
  const colors = theme.colors

  return {
    regular: colors.text,
    supporting: colors.textSupporting,
    shy: colors.textShy,
    primary: colors.primary,
    primaryAlt: colors.primaryAlt,
    reversed: colors.background,
    contrast: colors.contrast,
    danger: colors.danger,
    idle: colors.idle,
  }
}

type TextHeight = 'small' | 'regular' | 'large'
const lineHeight: Record<TextHeight, number> = {
  small: 1,
  regular: 1.2,
  large: 1.5,
}

type TextFontFamily = 'regular' | 'mono'
type TextColor = keyof ReturnType<typeof getTextColorRecord>

interface TextProps {
  color?: TextColor
  weight?: TextStyle['fontWeight']
  size?: number
  height?: TextHeight
  centerHorizontally?: boolean
  letterSpacing?: number
  centerVertically?: boolean | { gap: number }
  cropped?: boolean
  family?: TextFontFamily
  variant?: TextVariant
}

const text = ({
  color,
  weight,
  size,
  height,
  letterSpacing,
  variant,
  centerHorizontally,
  centerVertically,
  cropped,
  family = 'regular',
}: TextProps) => {
  const variantStyles = variant ? textVariantsRecord[variant] : {}

  return css`
    ${({ theme }) =>
      color &&
      css`
        color: ${getTextColorRecord(theme)[color]};
      `}
    ${weight || variantStyles.weight
      ? css`
          font-weight: ${weight ?? variantStyles.weight};
        `
      : ''}
    ${height || variantStyles.height
      ? css`
          line-height: ${lineHeight[
            height ?? (variantStyles.height as TextHeight)
          ]};
        `
      : ''}
    ${(size ?? variantStyles.size)
      ? css`
          font-size: ${size ?? variantStyles.size}px;
        `
      : ''}
    ${letterSpacing || variantStyles.letterSpacing
      ? css`
          letter-spacing: ${letterSpacing ?? variantStyles.letterSpacing}px;
        `
      : ''}
    ${centerHorizontally &&
    css`
      text-align: center;
    `}
    ${cropped || variantStyles.cropped
      ? css`
          overflow: hidden;
          text-overflow: ellipsis;
        `
      : ''}
    ${centerVertically &&
    css`
      display: flex;
      align-items: center;
      ${typeof centerVertically === 'object' &&
      css`
        gap: ${centerVertically.gap}px;
      `}
    `}
    font-family: ${family === 'mono' ? 'Menlo' : 'System'};
  `
}

export const Text: FC<PropsWithChildren & TextProps> = styled(
  RNText
)<TextProps>`
  ${text}
`

export const StrictText = styled(Text)`
  ${text({
    color: 'contrast',
    size: 14,
    weight: '400',
    family: 'mono',
  })}
`

export const GradientText = styled(Text)`
  background: linear-gradient(90deg, #33e6bf, #0439c7);
  background-clip: text;
  color: transparent;
`
