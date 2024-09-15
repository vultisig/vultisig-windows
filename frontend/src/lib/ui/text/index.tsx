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

export const Text = styled.p<TextProps>`
  margin: 0;
  padding: 0;
  overflow-wrap: break-word;

  ${({ color, theme }) =>
    color &&
    css`
      color: ${getTextColorRecord(theme)[color].toCssValue()};
    `}
  ${({ weight }) =>
    weight &&
    css`
      font-weight: ${weight};
    `}
  ${({ height }) =>
    height &&
    css`
      line-height: ${lineHeight[height]};
    `}
  ${({ size }) =>
    size &&
    css`
      font-size: ${toSizeUnit(size)};
    `}
  ${({ centerHorizontally }) =>
    centerHorizontally &&
    css`
      text-align: center;
    `}
  ${({ nowrap }) =>
    nowrap &&
    css`
      white-space: nowrap;
    `}
  ${({ cropped }) => cropped && cropText}

  ${({ centerVertically }) =>
    centerVertically &&
    css`
      display: inline-flex;
      align-items: center;
    `}

  font-family: ${({ family = 'regular' }) =>
    match(family, {
      mono: () => 'Menlo, monospace',
      regular: () => 'inherit',
    })};
`;
