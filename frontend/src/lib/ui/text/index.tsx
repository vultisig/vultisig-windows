import styled, { css, DefaultTheme } from 'styled-components';

import { match } from '../../utils/match';
import { cropText } from '../css/cropText';
import { toSizeUnit } from '../css/toSizeUnit';

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
  centerVertically?: boolean;
  cropped?: boolean;
  nowrap?: boolean;
  family?: TextFontFamily;
  as?: React.ElementType;
}

export const text = ({
  color,
  weight,
  size,
  height,
  centerHorizontally,
  centerVertically,
  cropped,
  nowrap,
  family = 'regular',
}: TextProps) => css`
  overflow-wrap: break-word;

  ${({ theme }) =>
    color &&
    css`
      color: ${getTextColorRecord(theme)[color].toCssValue()};
    `}
  ${weight &&
  css`
    font-weight: ${weight};
  `}
  ${height &&
  css`
    line-height: ${lineHeight[height]};
  `}
  ${size &&
  css`
    font-size: ${toSizeUnit(size)};
  `}
  ${centerHorizontally &&
  css`
    text-align: center;
  `}
  ${nowrap &&
  css`
    white-space: nowrap;
  `}
  ${cropped && cropText}

  ${centerVertically &&
  css`
    display: inline-flex;
    align-items: center;
  `}

  font-family: ${match(family, {
    mono: () => 'Menlo, monospace',
    regular: () => 'inherit',
  })};
`;

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

export const StrictText = styled.p`
  ${strictText}
`;
