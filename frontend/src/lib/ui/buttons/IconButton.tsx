import { ComponentProps, Ref, forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { UnstyledButton } from './UnstyledButton';
import { centerContent } from '../css/centerContent';
import { sameDimensions } from '../css/sameDimensions';
import { toSizeUnit } from '../css/toSizeUnit';
import { getColor, matchColor } from '../theme/getters';
import { borderRadius } from '../css/borderRadius';
import { match } from '../../utils/match';

export const iconButtonSizes = ['s', 'm', 'l'] as const;
export type IconButtonSize = (typeof iconButtonSizes)[number];

export const iconButtonKinds = ['regular', 'secondary'] as const;
export type IconButtonKind = (typeof iconButtonKinds)[number];

export const iconButtonSizeRecord: Record<IconButtonSize, number> = {
  s: 24,
  m: 32,
  l: 40,
};

export const iconButtonIconSizeRecord: Record<IconButtonSize, number> = {
  s: 14,
  m: 14,
  l: 16,
};

interface ContainerProps {
  size: IconButtonSize;
  kind: IconButtonKind;
  isDisabled?: boolean;
}

const Container = styled(UnstyledButton)<ContainerProps>`
  position: relative;
  ${centerContent};
  ${({ size }) => sameDimensions(iconButtonSizeRecord[size])};

  color: ${matchColor('kind', {
    regular: 'text',
    secondary: 'text',
    alert: 'alert',
    alertSecondary: 'alert',
  })};

  font-size: ${({ size }) => toSizeUnit(iconButtonIconSizeRecord[size])};

  ${borderRadius.s};

  ${({ kind }) =>
    kind !== 'secondary' &&
    css`
      border: 1px solid ${getColor('mist')};
    `}

  background: ${({ kind, theme: { colors } }) =>
    match(kind, {
      regular: () => colors.foreground,
      secondary: () => colors.transparent,
    }).toCssValue()};

  ${({ isDisabled, kind, theme }) =>
    !isDisabled &&
    css`
      &:hover {
        background: ${match(kind, {
          regular: () => theme.colors.foregroundExtra.toCssValue(),
          secondary: () => theme.colors.mist.toCssValue(),
        })};

        color: ${match(kind, {
          regular: () => getColor('contrast'),
          secondary: () => getColor('contrast'),
        })};
      }
    `}

  cursor: ${({ isDisabled }) => (isDisabled ? 'initial' : 'pointer')};
  opacity: ${({ isDisabled }) => (isDisabled ? 0.8 : 1)};
`;

export type IconButtonProps = Omit<
  ComponentProps<typeof Container>,
  'size' | 'kind' | 'isDisabled'
> & {
  icon: React.ReactNode;
  size?: IconButtonSize;
  kind?: IconButtonKind;
  title: string;
  as?: React.ElementType;
  isDisabled?: boolean | string;
};

export const IconButton = forwardRef(function IconButton(
  {
    size = 'm',
    kind = 'regular',
    icon,
    type = 'button',
    isDisabled = false,
    onClick,

    ...rest
  }: IconButtonProps,
  ref: Ref<HTMLButtonElement> | null
) {
  const containerProps = {
    type,
    kind,
    size,
    isDisabled: !!isDisabled,
    onClick: isDisabled ? undefined : onClick,
    ...rest,
  };

  return (
    <Container ref={ref} {...containerProps}>
      {icon}
    </Container>
  );
});