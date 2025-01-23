import styled, { css, DefaultTheme } from 'styled-components';

import { match } from '../../utils/match';
import { cropText } from '../css/cropText';
import { toSizeUnit } from '../css/toSizeUnit';

type TextVariant = 'h1Hero' | 'h1Regular';

const textVariantsRecord: Record<
  TextVariant,
  Pick<TextProps, 'size' | 'height' | 'weight' | 'cropped' | 'letterSpacing'>
> = {
  h1Hero: {
    size: 72,
    height: 'large',
    weight: 500,
    cropped: false,
    letterSpacing: -1.8,
  },
  h1Regular: {
    size: 60,
    height: 'large',
    weight: 500,
    cropped: false,
    letterSpacing: -1.5,
  },
};

const getTextColorRecord = ({ colors }: DefaultTheme) =>
  ({
    regular: colors.text,
    supporting: colors.textSupporting,
    shy: colors.textShy,
    primary: colors.primary,
    primaryAlt: colors.primaryAlt,
    reversed: colors.background,
    contrast: colors.contrast,
    danger: colors.danger,
  }) as const;

type TextHeight = 'small' | 'regular' | 'large';
const lineHeight: Record<TextHeight, number> = {
  small: 1,
  regular: 1.2,
  large: 1.5,
};

export type TextFontFamily = 'regular' | 'mono';

export type TextColor = keyof ReturnType<typeof getTextColorRecord>;

export interface TextProps {
  color?: TextColor;
  weight?: React.CSSProperties['fontWeight'];
  size?: number;
  height?: TextHeight;
  centerHorizontally?: boolean;
  letterSpacing?: number;
  centerVertically?:
    | boolean
    | {
        gap: number;
      };
  cropped?: boolean;
  nowrap?: boolean;
  family?: TextFontFamily;
  as?: React.ElementType;
  variant?: TextVariant;
}

export const text = ({
  color,
  weight,
  size,
  height,
  letterSpacing,
  variant,
  centerHorizontally,
  centerVertically,
  cropped,
  nowrap,
  family = 'regular',
}: TextProps) => {
  const variantStyles = variant ? textVariantsRecord[variant] : {};

  return css`
    overflow-wrap: break-word;

    ${({ theme }) =>
      color &&
      css`
        color: ${getTextColorRecord(theme)[color].toCssValue()};
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
          font-size: ${toSizeUnit((size ?? variantStyles.size) as number)};
        `
      : ''}
    ${letterSpacing || variantStyles.letterSpacing
      ? css`
          letter-spacing: ${toSizeUnit((size ?? variantStyles.size) as number)};
        `
      : ''}
    ${centerHorizontally &&
    css`
      text-align: center;
    `}
    ${nowrap &&
    css`
      white-space: nowrap;
    `}
    ${cropped || variantStyles.cropped ? cropText : ''}

    ${centerVertically &&
    css`
      display: inline-flex;
      align-items: center;

      ${typeof centerVertically === 'object' &&
      css`
        gap: ${toSizeUnit(centerVertically.gap)};
      `}
    `}

    font-family: ${match(family, {
      mono: () => 'Menlo, monospace',
      regular: () => 'inherit',
    })};
  `;
};

export const Text = styled.p<TextProps>`
  ${text};
`;

export const strictText = css`
  ${text({
    color: 'contrast',
    size: 14,
    weight: 400,
    family: 'mono',
  })}
`;

export const StrictText = styled(Text)`
  ${strictText}
`;
