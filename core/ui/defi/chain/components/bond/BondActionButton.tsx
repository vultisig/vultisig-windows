import { Button } from '@lib/ui/buttons/Button'
import { borderRadius } from '@lib/ui/css/borderRadius'
import { centerContent } from '@lib/ui/css/centerContent'
import { sameDimensions } from '@lib/ui/css/sameDimensions'
import { ChildrenProp, IconProp, UiProps } from '@lib/ui/props'
import { getColor } from '@lib/ui/theme/getters'
import styled, { css } from 'styled-components'

type BondActionKind = 'primary' | 'secondary'

type BondActionButtonProps = ChildrenProp &
  IconProp &
  UiProps & {
    kind: BondActionKind
    onClick: () => void
    disabled?: boolean
  }

const buttonHeight = 42
const iconContainerSize = 34
const iconInset = (buttonHeight - iconContainerSize) / 2
const buttonHorizontalPadding = 24
// Centers the label in the space the icon leaves free, as iOS does.
const labelShift = (iconInset + iconContainerSize) / 2

const Container = styled.div<{ $kind: BondActionKind }>`
  display: flex;

  > button {
    height: ${buttonHeight}px;
    min-height: ${buttonHeight}px;
    padding-left: ${buttonHorizontalPadding + labelShift}px;
    font-weight: 600;
  }

  ${({ $kind, theme }) =>
    $kind === 'secondary' &&
    css`
      > button:disabled {
        background-color: ${theme.colors.buttonSecondary
          .getVariant({ a: () => 0.6 })
          .toCssValue()};
        box-shadow: none;
      }
    `}
`

const IconContainer = styled.span<{ $disabled: boolean }>`
  position: absolute;
  top: ${iconInset}px;
  left: ${iconInset}px;
  ${centerContent};
  ${sameDimensions(iconContainerSize)};
  ${borderRadius.pill};
  background: ${getColor('mistExtra')};
  color: ${getColor('text')};
  font-size: 16px;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
`

/**
 * A bonded node's Bond or Unbond action: a pill with its icon in a circle at
 * the leading edge. A disabled Unbond keeps a dimmed fill instead of turning
 * into an outline.
 */
export const BondActionButton = ({
  kind,
  icon,
  children,
  onClick,
  disabled = false,
  className,
  style,
}: BondActionButtonProps) => (
  <Container $kind={kind} className={className} style={style}>
    <Button kind={kind} onClick={onClick} disabled={disabled}>
      <IconContainer $disabled={disabled}>{icon}</IconContainer>
      {children}
    </Button>
  </Container>
)
