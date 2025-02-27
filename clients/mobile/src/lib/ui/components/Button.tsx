import { match } from '@lib/utils/match'
import { FC, PropsWithChildren } from 'react'
import { TouchableOpacity } from 'react-native'
import styled, { css } from 'styled-components/native'

import { getColor } from '../utils'
export const buttonSizes = ['medium', 'small', 'mini'] as const

type ButtonSize = (typeof buttonSizes)[number]
export const buttonKinds = ['primary', 'secondary'] as const
export type ButtonKind = (typeof buttonKinds)[number]

interface ContainerProps {
  size: ButtonSize
  isDisabled?: boolean
  isLoading?: boolean
  isRounded?: boolean
  kind: ButtonKind
}

export type ButtonProps = Omit<
  React.ComponentProps<typeof Container>,
  'size' | 'kind' | 'isDisabled'
> & {
  size?: ButtonSize
  isDisabled?: boolean | string
  isLoading?: boolean
  isRounded?: boolean
  kind?: ButtonKind
  onPress?: () => void
  as?: React.ElementType
}

export const Button: FC<PropsWithChildren & ButtonProps> = ({
  children,
  size = 'medium',
  kind = 'primary',
  ...rest
}) => {
  return (
    // TODO: @tony to add loading state
    <Container size={size} {...rest} kind={kind}>
      {children}
    </Container>
  )
}

const Container = styled(TouchableOpacity)<ContainerProps>`
  display: flex;
  justify-content: center;
  align-items: center;
  position: relative;
  font-weight: 600;
  flex-shrink: 0;
  border-radius: 99px;

  ${({ size }: { size: ButtonSize }) =>
    match(size, {
      medium: () => css`
        padding: 14px 32px;
      `,
      small: () => css`
        padding: 12px 24px;
      `,
      mini: () => css`
        padding-inline: 12px;
      `,
    })}

  ${({ isDisabled }: { isDisabled?: boolean }) =>
    isDisabled &&
    css`
      background-color: ${getColor('buttonBackgroundDisabled')};
      color: ${getColor('textShy')};
    `}

    ${({ kind }: { kind: ButtonKind }) =>
    match(kind, {
      primary: () => css`
        background-color: ${getColor('primary')};
        color: ${getColor('textDark')};
      `,
      secondary: () => css`
        background-color: ${getColor('foregroundExtra')};
        color: ${getColor('textDark')};
      `,
    })}
`
